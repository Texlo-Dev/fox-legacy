export default function({ app }) {
  app.$auth.onError((error, name) => {
    console.error(name, error);
  });
}
