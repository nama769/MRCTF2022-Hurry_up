const express = require("express");
const uuid = require("uuid").v4;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const path = require("path");

const BIND_ADDR = process.env.BIND_ADDR || "127.0.0.1";
const LPORT = process.env.LPORT || 3000;
const SESSION_SECRET = uuid();
const REDIS_URI = "redis://" + (process.env.REDIS_HOST || "127.0.0.1:6379");
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

const app = express();

// Redis config
const redisClient = redis.createClient({
    url: REDIS_URI,
    legacyMode: true,
    password: REDIS_PASSWORD,
});
redisClient
    .connect()
    .then(() => console.log("Redis Connected."))
    .catch((err) => console.log(err));

// EJS
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.disable('view cache');

// body parser
app.use(express.urlencoded({ extended: false }));

// cookie parser
app.use(cookieParser());

// // trust first proxy for secure cookies
// app.set("trust proxy", 1);

// express session
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        name: "cp-session",
        cookie: {
            maxAge: 1000 * 60 * 6,
            // secure: true,
            httpOnly: true,
            sameSite: "lax",
        },
    })
);

// csp and no way of pp
app.use(async (req, res, next) => {
    res.header(
        "Content-Security-Policy",
        "default-src 'self';"
    );
    await new Promise(function (resolve) {
        for (var key in Object.prototype) {
            console.log(key);
            delete Object.prototype[key];
        }
        resolve()
    }).then(next)
});

// routes
app.use("/", require("./routes/index"));
app.use(express.static("/app/public"));

app.listen(
    LPORT,
    BIND_ADDR,
    console.log(`Started on http://${BIND_ADDR}:${LPORT}`)
);
