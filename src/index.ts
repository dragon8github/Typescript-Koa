import * as Koa from 'koa';

const app = new Koa();

app.use(async ctx => {
    ctx.body = "Todo App";
});

app.listen(3000, () => {
    console.log("Server Stared on http://localhost:3000")
})