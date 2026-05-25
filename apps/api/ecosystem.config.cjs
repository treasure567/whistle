module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/server.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      out_file: '../shared/logs/api-out.log',
      error_file: '../shared/logs/api-err.log',
      merge_logs: true,
      time: true,
      kill_timeout: 25000,
    },
  ],
};
