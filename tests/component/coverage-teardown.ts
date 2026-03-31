import fs from 'node:fs';
import path from 'node:path';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';

const RAW_DIR = 'coverage-ct-raw';
const OUT_DIR = 'coverage-ct';

export default async function teardown() {
  if (!process.env.COVERAGE) return;
  if (!fs.existsSync(RAW_DIR)) return;

  const map = libCoverage.createCoverageMap({});
  for (const file of fs.readdirSync(RAW_DIR)) {
    const raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf8'));
    map.merge(raw);
  }

  const context = libReport.createContext({ dir: OUT_DIR, coverageMap: map });
  reports.create('lcovonly').execute(context);

  fs.rmSync(RAW_DIR, { recursive: true });
}
