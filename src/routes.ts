import { Socket } from 'socket.io';
import { baseURL } from "./apiConfig.json";

import { User } from './controllers/User';
import { Unique } from './controllers/Unique';
import { Bond } from './controllers/Bond';

export default (socket: Socket) => {
    console.log(socket.id);

    const uniqueID = new Unique();
    socket.on("UniqueID::generate", () => uniqueID.generate(socket));
    socket.on("UniqueID::reference", (id) => uniqueID.reference(id, socket));

    const user = new User({ baseURL });
    socket.on("user::login", async (credentials) => await user.login(credentials, { socket, uniqueID: uniqueID.id }));
    socket.on("user::logoff", async () => await user.logoff({ socket }));

    const bond = new Bond();
    socket.on("bonds::list", async (inactive) => await bond.list({socket, inactive}));

    socket.on("disconnect", async () => await user.logoff({ socket }));
};

