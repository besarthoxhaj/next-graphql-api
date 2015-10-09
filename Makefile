TEST_APP := "ft-next-graphql-api-${CIRCLE_BUILD_NUM}"

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

watch:
	nbt build --dev --watch

run:
	nbt run

provision:
	nbt float
	nbt deploy-hashed-assets

tidy:
	# `nbt float` now tidys up after itself

deploy:
	nbt ship -m
	nbt deploy-hashed-assets
