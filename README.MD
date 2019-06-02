传送门教程：https://miyogurt.github.io/nodelover-books/#/koa-todo-api/搭建项目开发环境

源码地址：https://github.com/MiYogurt/todo-api

---

**1 新建项目**：`$ mkdir todo && cd todo && npm init -y && git init`

**2 安装 Typescript 环境**：`$ npm i -g typescript && tsc --init`

**3 安装依赖项**：`$ npm i koa -S && npm i @types/koa @types/node -D`

**4 配置tsconfig.json**：配置输出文件夹，且使其支持 async/await 特性。

```JavaScript
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "noImplicitAny": false,
        "sourceMap": false,
        "outDir": "dist",
        "lib": [
            "es6",
            "es7"
        ]
    }
}
```

**5 创建 src/index.ts ：**

```Typescript
import * as Koa from 'koa';

const app = new Koa();

app.use(async ctx => {
    ctx.body = "Todo App";
});

app.listen(3000, () => {
    console.log("Server Stared on http://localhost:3000")
})
```

由于使用了 **Typescript** ，我们就可以在 **Node.js** 中使用 `es6 modules` 规范了。

✅ 我们先在命令行里面输入： `$ tsc` 

然后会对所有.ts文件进行编译。当编译完成之后，我们应该可以看到一个 dist 文件夹。


**6 package.json 增加 start 脚本**

```bash
"start": "node dist/index.js"
```

再在命令行里面运行：`npm start`

**7 部署 node 服务器的神器： pm2**：`$ npm i -g pm2`

难道每次写完代码我都需要重启服务器？

为了解决这个问题，我们需要 pm2 这个工具，这是一个部署 node 服务器的神器，能够实现自动重启。

✅ 在 package.json 里面添加一些脚本：

```JavaScript
"scripts": {
    "tsc": "tsc --watch",
    "start": "pm2 start dist/index.js --watch dist"
},
```

⚠️ 此时我们需要启动俩个控制台：先运行 tsc 命令，再运行 start。

```JavaScript
$ npm run tsc

/* 新建另一个窗口 */

$ npm run start
```

## 安装插件

🚀 所有 koa 插件都可以在这里找到：https://github.com/koajs/koa/wiki

**8 安装 body 解析插件：** `$ npm install koa-better-body -S`

**9 安装路由插件：** `$ npm install koa-better-router -S`

⚠️ 由于使用的是 `koa@3.x` 的 `better` 系列插件，我们需要 `koa-convert` 这个工具。

```bash
$ npm i koa-convert -S
```

📝 修改我们的 `index.ts`

```JavaScript
import * as Koa from 'koa';
import * as bodyParser from 'koa-better-body';
import * as Router from 'koa-better-router';
import * as Convert from 'koa-convert';

const router = Router().loadMethods();

const app = new Koa();

router.get('/hello', async (ctx, next) => {
  ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
  await next()
});

router.get('/foobar', async (ctx, next) => {
  ctx.body = `Foo Bar Baz! ${ctx.route.prefix}`
  await next()
})

const api = Router({ prefix: '/api' })
api.extend(router)

app.use(Convert(bodyParser()));
app.use(router.middleware());
app.use(api.middleware());

app.listen(3000, () => {
    console.log("Server Stared on http://localhost:3000")
});
```