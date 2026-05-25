let io = null;

export const setIo = (serverIo) => {
  io = serverIo;
};

export const getIo = () => io;

export default { setIo, getIo };
