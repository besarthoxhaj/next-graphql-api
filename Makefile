TEST_APP := "ft-next-graphql-api-${CIRCLE_BUILD_NUM}"

.PHONY: test

clean:
	git clean -fxd

install:
	obt install --verbose

verify:
	obt verify --esLintPath=./.eslintrc

unit-test:
	export NODE_ENV="test"; export MYFT_API_URL="http://my.ft.com/"; export GRAPHQL_API_KEY=123; \
	mocha --require test/setup --recursive --reporter spec test/server/

test: verify unit-test

build:
	nbt build --dev

build-production:
	nbt build

watch:
	nbt build --dev --watch

run:
	nbt run --local

provision:
	nbt float -md --testapp ${TEST_APP}
	nbt deploy-hashed-assets
	nbt test-urls ${TEST_APP}

tidy:
	nbt destroy ${TEST_APP}

deploy:
	nbt ship -m
	nbt deploy-hashed-assets
