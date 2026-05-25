module.exports = {
  apps: [
    {
      name: 'agents',
      script: 'dist/server.js',
      cwd: '.',
      // Singleton: a second instance would double post every agent
      // transaction onchain. Never run this in cluster mode.
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      out_file: '../shared/logs/agents-out.log',
      error_file: '../shared/logs/agents-err.log',
      merge_logs: true,
      time: true,
      kill_timeout: 25000,
    },
  ],
};
