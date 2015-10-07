TEST_APP := "ft-graphql-branch-${CIRCLE_BUILD_NUM}"

.PHONY: test

clean:
	git clean -fxd

install:
	obt install --verbose

verify:
	obt verify --esLintPath=./.eslintrc

unit-test:
	mocha --compilers js:babel/register --recursive --reporter spec test/server/

test: verify unit-test

build:
	nbt build --dev

build-production:
	nbt build
	nbt about

watch:
	nbt build --dev --watch

run:
	nbt run

provision:
	nbt provision ${TEST_APP}
	nbt configure ft-next-graphql-api ${TEST_APP} --overrides "NODE_ENV=branch"
	nbt deploy-hashed-assets
	nbt deploy ${TEST_APP} --skip-enable-preboot --skip-logging

tidy:
	nbt destroy ${TEST_APP}

deploy:
	nbt configure
	nbt deploy-hashed-assets
	nbt deploy --skip-logging
