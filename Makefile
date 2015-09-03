.PHONY: test build

install:
	origami-build-tools install --verbose

test:
	mocha --compilers js:babel/register --recursive --reporter spec test/server/

run:
	nbt run

run-local:
	nbt run --local

build:
	webpack

watch:
	webpack --watch

build-production:
	NODE_ENV=production webpack --bail
	nbt about
