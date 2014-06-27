.PHONY: build
build: node_modules

node_modules: package.json
	npm install
	touch $@

.PHONY: clean
clean:
	rm -rf node_modules
