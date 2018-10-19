export default ({ $axios }) => {
    $axios.onRequest(console.log);
};
