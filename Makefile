.PHONY: test build

install:
	origami-build-tools install --verbose

verify:
	obt verify --esLintPath=./.eslintrc

run:
	nbt run

run-local:
	nbt run --local

build:
	webpack

build-production:
	NODE_ENV=production webpack --bail
	nbt about
