# Команды проекта. Выкатка вручную — раздел «Выкатка руками» в README.md.
.PHONY: help check deploy deploy-dry

help:
	@echo "make check        lint, typecheck, test, generate, проверки статики"
	@echo "make deploy       выкатка на сервер без Actions (DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH …)"
	@echo "make deploy-dry   то же, но rsync --dry-run: на сервере ничего не меняется"

check:
	pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run generate
	scripts/check-legal.sh .output/public
	scripts/check-agent-readiness.sh .output/public

deploy:
	scripts/deploy.sh

deploy-dry:
	DRY=1 scripts/deploy.sh
