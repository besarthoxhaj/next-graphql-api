TEST_APP := "ft-graphql-branch-${CIRCLE_BUILD_NUM}"

.PHONY: test

clean:
	git clean -fxd

install:
	obt install --verbose

verify:
	nbt verify

unit-test:
	mocha --compilers js:babel/register --recursive --reporter spec test/server/

test: verify unit-test

build-production:
	nbt about

run:
	nbt run --local

provision:
	nbt provision ${TEST_APP}
	nbt configure ft-next-article ${TEST_APP} --overrides "NODE_ENV=branch"
	nbt deploy ${TEST_APP} --skip-enable-preboot --skip-logging

tidy:
	nbt destroy ${TEST_APP}

deploy:
	nbt configure
	nbt deploy
