export default {
  namespaced: true,
  state: {
    pacmanCoordinates: { x: 1, y: 1 },
  },
  mutations: {
    setPacmanCoordinates(state, coordinates) {
      state.pacmanCoordinates = coordinates;
    },
  },
  actions: {
    updatePacmanCoordinates({ commit }, coordinates) {
      commit('setPacmanCoordinates', coordinates);
    },
  },
  getters: {
    getPacmanCoordinates: (state) => state.pacmanCoordinates,
  },
}