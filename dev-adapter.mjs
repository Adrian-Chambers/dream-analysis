export default {
    name: 'development',
    hooks: {
      'astro:config:setup': ({ config }) => {
        config.publicEntrypoint = 'server';
        config.devFrameworks = { server: true };
      }
    }
  };