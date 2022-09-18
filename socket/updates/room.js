import { getActiveRooms, getSocketServerInstance } from "../../socketServer";

const updateRooms = () => {
  const io = getSocketServerInstance();
  const activeRooms = getActiveRooms();
};
