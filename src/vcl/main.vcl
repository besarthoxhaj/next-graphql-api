backend graphql_api {
	.connect_timeout = 1s;
	.dynamic = true;
	.port = "80";
	.host = "ft-next-graphql-api.herokuapp.com";
	.host_header = "ft-next-graphql-api.herokuapp.com";
	.first_byte_timeout = 15s;
	.max_connections = 200;
	.between_bytes_timeout = 10s;
	.share_key = "f8585BOxnGQDMbnkJoM1e";

	.probe = {
		.request = "HEAD /__gtg HTTP/1.1" "Host: ft-next-graphql-api.herokuapp.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
		.threshold = 1;
		.window = 2;
		.timeout = 5s;
		.initial = 1;
		.expected_response = 200;
		.interval = 30s;
	}
}

backend graphql_api_eu {
	.connect_timeout = 1s;
	.dynamic = true;
	.port = "80";
	.host = "ft-next-graphql-api-eu.herokuapp.com";
	.host_header = "ft-next-graphql-api-eu.herokuapp.com";
	.first_byte_timeout = 15s;
	.max_connections = 200;
	.between_bytes_timeout = 10s;
	.share_key = "f8585BOxnGQDMbnkJoM1e";

	.probe = {
		.request = "HEAD /__gtg HTTP/1.1" "Host: ft-next-graphql-api-eu.herokuapp.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
		.threshold = 1;
		.window = 2;
		.timeout = 5s;
		.initial = 1;
		.expected_response = 200;
		.interval = 30s;
	}
}

backend graphql_api_us {
	.connect_timeout = 1s;
	.dynamic = true;
	.port = "80";
	.host = "ft-next-graphql-api-us.herokuapp.com";
	.host_header = "ft-next-graphql-api-us.herokuapp.com";
	.first_byte_timeout = 15s;
	.max_connections = 200;
	.between_bytes_timeout = 10s;
	.share_key = "f8585BOxnGQDMbnkJoM1e";

	.probe = {
		.request = "HEAD /__gtg HTTP/1.1" "Host: ft-next-graphql-api-us.herokuapp.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
		.threshold = 1;
		.window = 2;
		.timeout = 5s;
		.initial = 1;
		.expected_response = 200;
		.interval = 30s;
	}
}

sub vcl_recv {
	#FASTLY recv

	if (req.request != "HEAD" && req.request != "GET" && req.request != "FASTLYPURGE") {
		return(pass);
	}

	if (!req.http.X-Geoip-Continent) {
		set req.http.X-Geoip-Continent = geoip.continent_code;
	}

	set req.http.X-EU-Host = "ft-next-graphql-api-eu.herokuapp.com";
	set req.http.X-US-Host = "ft-next-graphql-api-us.herokuapp.com";



	# Support Legacy header
	if(!req.http.FT-Session-Token && req.http.X-FT-Session-Token){
		set req.http.FT-Session-Token = req.http.X-FT-Session-Token;
	}

	if(!req.http.FT-Session-Token && req.http.Cookie ~ "FTSession"){
		set req.http.FT-Session-Token = regsub(req.http.Cookie, "^.*FTSession=([^;]+).*$", "\1");
	}

	# ensure this is never (null)
	if(!req.http.FT-Session-Token){
		set req.http.FT-Session-Token = "";
	}

	#get query string
	if(req.url ~ "\?") {
		set req.http.Query-String = regsub(req.url, "^.*(\?.*$)", "\1");
        set req.url = regsub(req.url, "\?.*$", "");
	}


	# ensure trailing slash
	if(req.url !~ "/$"){
		set req.url = req.url "/";
	}

	if(!req.http.Query-String || req.http.Query-String !~ "\?"){
    		set req.http.Query-String = "";
    	}

	set req.url = req.url req.http.FT-Session-Token req.http.Query-String;
	set req.http.Authorization = "${AUTH_KEY}";

	if (req.http.X-Geoip-Continent ~ "(NA|SA|OC)") {
		set req.backend = graphql_api_us;
		set req.http.Backend = "graphql_api_us";
		set req.http.Host = req.http.X-US-Host;
		if (!req.backend.healthy) {
			set req.backend = graphql_api_eu;
			set req.http.Backend = "graphql_api_eu";
			set req.http.Host = req.http.X-EU-Host;
		}
	} else {
		set req.backend = graphql_api_eu;
		set req.http.Backend = "graphql_api_eu";
		set req.http.Host = req.http.X-EU-Host;
		if (!req.backend.healthy) {
			set req.backend = graphql_api_us;
			set req.http.Backend = "graphql_api_us";
			set req.http.Host = req.http.X-US-Host;
		}
	}

	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=SESSION_REQUEST url="} req.url {" token="} req.http.FT-Session-Token;

	return(lookup);
}

sub vcl_fetch {
	#FASTLY fetch

	if ((beresp.status == 500 || beresp.status == 503) && req.restarts < 1 && (req.request == "GET" || req.request == "HEAD")) {
		restart;
	}

	if(req.restarts > 0 ) {
		set beresp.http.Fastly-Restarts = req.restarts;
	}

	if (beresp.http.Set-Cookie) {
		set req.http.Fastly-Cachetype = "SETCOOKIE";
		return (pass);
	}

	if (beresp.http.Cache-Control ~ "private") {
		set req.http.Fastly-Cachetype = "PRIVATE";
		return (pass);
	}

	if (beresp.status == 500 || beresp.status == 503) {
		set req.http.Fastly-Cachetype = "ERROR";
		set beresp.ttl = 1s;
		set beresp.grace = 5s;
		return (deliver);
	}

	if (beresp.http.Expires || beresp.http.Surrogate-Control ~ "max-age" || beresp.http.Cache-Control ~"(s-maxage|max-age)") {
		# keep the ttl here
	} else {
		# apply the default ttl
		set beresp.ttl = 3600s;
	}

	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=BACKEND_RESPONSE status="} beresp.status {"  "};

	return(deliver);
}

sub vcl_hit {
	#FASTLY hit

	if (!obj.cacheable) {
		return(pass);
	}

	return(deliver);
}

sub vcl_miss {
	#FASTLY miss
	return(fetch);
}

sub vcl_deliver {
	#FASTLY deliver

	if(req.http.Error-Message){
		set resp.http.Error-Message = req.http.Error-Message;
	}

	if(req.http.FT-Session-Token){
		set resp.http.FT-Session-Token = req.http.FT-Session-Token;
	}else{
		set resp.http.X-FT-Session-Token = "";
	}

	set resp.http.Cookie-String = req.http.Cookie;
	set resp.http.Query-String = req.http.Query-String;

	if(req.http.Origin && !resp.http.Access-Control-Allow-Origin){
		set resp.http.Access-Control-Allow-Origin = req.http.Origin;
	}

	set resp.http.X-Geoip-Continent = req.http.X-Geoip-Continent;
	set resp.http.Backend = req.http.Backend;

	set resp.http.CDN-Cache-Control = resp.http.Cache-Control;
	set resp.http.Cache-Control = "private, no-cache, max-age=0";


	return(deliver);
}

sub vcl_error {
	#FASTLY error
	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=ERROR url="} req.url {" status="} obj.status {"  "};
}

sub vcl_pass {
	#FASTLY pass
}
