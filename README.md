# Tick It Off

<div align="left">
  <a href="https://github.com/viliusddd/tick-it-off/actions/workflows/deploy.yaml">
    <img
      title="Lint, test and build action status"
      src="https://github.com/viliusddd/tick-it-off/actions/workflows/deploy.yaml/badge.svg"
    >
  </a>
  <a href="https://codecov.io/gh/viliusddd/tick-it-off" >
    <img
      title="Code test coverage percentage"
      src="https://codecov.io/gh/viliusddd/tick-it-off/graph/badge.svg?token=6Flp5F3ty0"
    >
  </a>
</div><br>

More organised than a queue at the post office, and just as satisfying to get through!

- [Tick It Off](#tick-it-off)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [TL;DR Setup](#tldr-setup)
  - [API Endpoints](#api-endpoints)
    - [todo](#todo)
    - [completion](#completion)
    - [user](#user)

## Features

- Use pagination.
- Signin/signup.
- !WIP: Twilio Sendgrid integration
- !TODO: Share todo's with others
- !TODO: Ability to to the *TODO* item together, see each other's progress.

## Tech Stack

<a href="https://postgresql.org">
  <img
    title="The World's Most Advanced Open Source Relational Database."
    src="https://shields.io/badge/PostgreSQL-4169e1.svg?logo=postgresql&logoColor=white"
  >
</a>
<a href="https://typescriptlang.org">
  <img
    title="TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
    src="https://shields.io/badge/TypeScript-007ACC.svg?logo=typescript&logoColor=white"
    >
</a>
<a href="https://trpc.io">
  <img
    title="Move Fast and Break Nothing. End-to-end typesafe APIs made easy."
    src="https://shields.io/badge/tRPC-2596BE.svg?logo=trpc&logoColor=white"
  >
</a>
<a href="https://tailwindcss.com">
  <img
    title="A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup."
    src="https://img.shields.io/badge/tailwindcss-0F172A?&logo=tailwindcss"
  >
</a>
<a href="https://zod.dev">
  <img
    title="TypeScript-first schema validation with static type inference."
    src="https://shields.io/badge/Zod-000000.svg?logo=Zod&logoColor=3068B7"
  >
</a>
<a href="https://expressjs.com">
  <img
    title="Fast, unopinionated, minimalist web framework for Node.js."
    src="https://shields.io/badge/Express.js-000000.svg?logo=express&logoColor=white"
  >
</a>
<a href="https://nodejs.org">
  <img
    title="Node.js® is a free, open-source, cross-platform JavaScript runtime environment that lets developers create servers, web apps, command line tools and scripts."
    src="https://shields.io/badge/Node.js-0D121C.svg?logo=node.js&logoColor=5FA04E"
  >
</a>
<a href="https://vuejs.org">
  <img
    title="An approachable, performant and versatile framework for building web user interfaces."
    src="https://shields.io/badge/Vue.js-35495E.svg?logo=vuedotjs&logoColor=4FC08D"
  >
</a>
<a href="https://vitest.dev">
  <img
    title="A Vite-native testing framework. It's fast!"
    src="https://shields.io/badge/Vitest-6E9F18.svg?logo=vitest&logoColor=FCC72B"
  >
</a>

## TL;DR Setup

1. Install dependencies

```sh
git clone git@github.com:viliusddd/tick-it-off.git && \
cd tick-it-off && \
cp .env.example .env && \
npm i && \
npm run migrate:latest && \
nvm use
```
2. Run app:
  - Start PostgreSQL server.
  - Adjust `.env` variables.
  - Execute `npm run dev` in `server/` for backend and `client/` for frontend.

## API Endpoints

With the server running, go to http://localhost:3000/api/v1/trpc-panel to have access to all available routes.

### todo

<details open>

<summary>todo.findAll</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/todo.findAll | jq
```

</details>

<details open>

<summary>todo.create</summary>

> Need to login with user.login endpoint first and then replace $ACCESS_TOKEN with the accessToken.

```sh
curl -s http://localhost:3000/api/v1/trpc/todo.create \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $ACCESS_TOKEN' \
  -d '{"json": {"title": "bar"}}' | jq
```

</details>

<details>

<summary>todo.create</summary>

> Need to login with user.login endpoint first and ant then pass the accessToken below.

```sh
curl -s http://localhost:3000/api/v1/trpc/todo.update \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer access-token-from-user-login' \
  -d '{"json": {"id": 19, "title": "Foo bar baz"}}' | jq
```

</details>

<details>

<summary>todo.deleteById</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/todo.deleteById?batch=1 \
  -H "Content-Type: application/json" \
  -d '{"0": {"json": {"id": 1}}}' | jq
```

</details>

### completion

<details>

<summary>completion.create</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/completion.create \
  -H 'Content-Type: application/json' \
  -d '{"json": {"todoId": 7}}' | jq
```

</details>

<details>

<summary>completion.deleteById</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/completion.deleteById \
  -H 'Content-Type: application/json' \
  -d '{"json": {"todoId": 1}}' | jq
```

</details>

<details>

<summary>completion.findByRange</summary>

`date` is optional. By default it's current day.

```sh
N/A
```

</details>

<details>

<summary>completion.toggle</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/completion.toggle?batch=1 \
  -H 'Content-Type: application/json' \
  -d '{"0": {"json": {"todoId": 1}}}' | jq
```

</details>

### user

<details>

<summary>user.login</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/user.login \
  -H "Content-Type: application/json" \
  -d @- << EOF | jq
{
  "json": {
    "email": "foo@bar.baz",
    "password": "foobar123"
  }
}
EOF
```

</details>

<details>

<summary>user.signup</summary>

```sh
curl -s http://localhost:3000/api/v1/trpc/user.signup \
  -H "Content-Type: application/json" \
  -d @- << EOF | jq
{
  "json": {
    "firstName": "foo",
    "lastName": "bar",
    "email": "foo@bar.bazz",
    "password": "foobar123"
  }
}
EOF
```
