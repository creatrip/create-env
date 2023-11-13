```yml
name: Create envfile

on: [push]

jobs:
  create-env:
    runs-on: ubuntu-latest

    steps:
      - name: Make env
        uses: creatrip/create-env@main
        with:
          envkey_DEBUG: false
          envkey_SOME_API_KEY: '123456abcdef'
          envkey_SECRET_KEY: ${{ secrets.SECRET_KEY }}
          directory: <directory_name>
          token: <infisical_token>
          env: <infisical_env>
```
