module.exports = {
  apps: [
    {
      name: 'spotify-manager',
      script: 'packages/backend/dist/index.js',
      cwd: '/opt/spotify-manager',   // change to your deploy path on the server
      env_production: {
        NODE_ENV: 'production',
      },
      // Restart if memory exceeds 300 MB
      max_memory_restart: '300M',
      // Keep logs manageable
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
