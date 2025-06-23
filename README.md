<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Minio

```
docker run \
   -p 9004:9000 \
   -p 9005:9005 \
   --name minio \
   -v ~/data_minio:/data \
   -e "MINIO_ROOT_USER=namth" \
   -e "MINIO_ROOT_PASSWORD=01664157092aA" \
   quay.io/minio/minio server /data --console-address ":9005"
```

## Features

- Redis.
- Ghi log + kibana + elastic search.
- Minio (S3).

## Đang làm
- scp lại file docker compose rồi run lại elastic, kibana
- log, kibana


transaction cho chỗ tạo thread

xóa mềm thread

điều chỉnh quyền riêng tư thread

