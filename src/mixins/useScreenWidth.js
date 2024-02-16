const widthScreen = {
  data() {
    return {
      screenWidth: 0,
      screenWidthBreakpoints: {
        phones: 640,
        tablets: 992,
        laptops: 1220,
        desktops: 1920,
      },
    };
  },
  methods: {
    updateWidth() {
      this.screenWidth = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateWidth);
    this.updateWidth();
  },
  unmounted() {
    window.removeEventListener('resize', this.updateWidth);
  },
};

export default widthScreen;