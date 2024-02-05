import express from "express"
import Path from "path"
import { config } from "dotenv"
import { initiateApp } from "./src/utils/initiateApp.js"
config({path: Path.resolve('./config/config.env')})
const app = express()
initiateApp(app,express)
