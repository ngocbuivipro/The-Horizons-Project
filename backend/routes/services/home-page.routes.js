import {searchGlobal} from "../../controller/services/home-page.controller.js";
import router from "./bus.routes.js";
import {Router} from "express";


router.get("/global", searchGlobal); // API sẽ là: /api/search/global?keyword=Hanoi

export default router;
