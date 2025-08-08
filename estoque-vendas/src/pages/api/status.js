import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { stdout, stderr } = await new Promise((resolve) => {
      exec('npm test -- --json --outputFile=test-results.json', { cwd: process.cwd() }, (error, stdout, stderr) => {
        resolve({ stdout, stderr, error });
      });
    });

    const resultPath = path.join(process.cwd(), 'test-results.json');
    const raw = await fs.readFile(resultPath, 'utf8');
    const json = JSON.parse(raw);

    const details = json.testResults.map((t) => ({
      name: t.name.split('/').pop(),
      status: t.status,
      duration: t.duration,
      message: (t.failureMessages || []).join('\n'),
    }));

    const lastTest = details[details.length - 1];

    const pkgRaw = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);

    let lastCommit = null;
    try {
      const commit = await new Promise((resolve, reject) => {
        exec('git log -1 --format=%cI', { cwd: process.cwd() }, (err, stdout) => {
          if (err) return resolve(null);
          resolve(stdout.trim());
        });
      });
      lastCommit = commit;
    } catch (e) {
      lastCommit = null;
    }

    const runtime = details.reduce((acc, t) => acc + (t.duration || 0), 0);

    res.status(200).json({
      version: pkg.version,
      lastCommit,
      apiStatus: 'ok',
      tests: {
        lastRun: json.startTime,
        success: json.numFailedTests === 0,
        stats: {
          total: json.numTotalTests,
          passed: json.numPassedTests,
          failed: json.numFailedTests,
          runtime,
        },
        details,
        lastTest,
        logs: stderr,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
