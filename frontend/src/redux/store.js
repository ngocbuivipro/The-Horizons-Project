import {configureStore} from "@reduxjs/toolkit"
import { UserReducer } from "./reducers/UserReducer";
import { AdminReducer } from "./reducers/AdminReducer";
import { WishlistReducer } from "./reducers/WishlistReducer";
import { HotelReducer } from "./reducers/HotelReducer";
import { RoomReducer } from "./reducers/RoomReducer";
import { BusReducer } from "./reducers/BusReducer";
import {SystemReducer} from "./reducers/SystemReducer.js";

const Store = configureStore({
    reducer:{
        UserReducer:UserReducer,
        AdminReducer:AdminReducer,
        WishlistReducer:WishlistReducer,
        HotelReducer:HotelReducer,
        RoomReducer:RoomReducer,
        BusReducer:BusReducer,
        SystemReducer: SystemReducer,
    }
})

export default Store;