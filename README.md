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
  - [Database Diagram](#database-diagram)
  - [tRPC Panel](#trpc-panel)

## Features

- Use of pagination in todo list.
- Sign in/up.
- Password manager correctly recognize input fields.
- Share same types and validation schemas between backend and frontend.
- !WIP: Twilio Sendgrid integration
- Share todo with afriend.

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

# backend
cd tick-it-off && \
npm i && \
cd server && \
cp .env.example .env && \
# adjust .env values
npm run migrate:latest && \
nvm use && \

# frontend
cd ../server && \
cp .env.example .env
# adjust .env values
```

2. Run app:

- Start PostgreSQL server.
- Adjust `.env` variables.
- Execute `npm run dev` in `server/` for backend and same in `client/` for frontend.

## Database Diagram

<div>
  <a href="https://drawsql.app/teams/my-team-2119/diagrams/tickitoff2/embed">
  <img
    title="tick-it-off postgreSQL diagram."
    src="./assets/tick-it-off-sql-diagram.png">
  </a>
</div>

<br>

- **completion**: stores entries on when the todo item was completed.
- **todo**: stores todo entries.
- **user**: stores user information.
- **shared:_todo** stores info on which users the todo item was shared with.
- **user_relationship**: are users friends.

## tRPC Panel

With the server running, go to <http://localhost:3000/api/v1/trpc-panel> to access available routes and their documentation.

Need to login first, to be able to poke around the tRPC Panel:

1. Login, using `user/login`, copy `accessToken` value from the response.
2. Go to `Headers` at the top right corner, enter `Authorization` to `key` and `accessToken` from previous step to `value` field. Confirm
