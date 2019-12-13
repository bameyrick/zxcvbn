import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { Dictionary } from '../shared/types';
import { asyncForEach } from '../shared/utils';

type FrequencyLists = Dictionary<Dictionary<number>>;

const dictionaries: Dictionary<number> = {
  us_tv_and_film: 30000,
  english_wikipedia: 30000,
  passwords: 30000,
  surnames: 10000,
  male_names: -1,
  female_names: -1,
};

async function parseFrequencyLists(dataDirectory: string): Promise<FrequencyLists> {
  const frequencyLists: FrequencyLists = {};

  await asyncForEach(fs.readdirSync(dataDirectory), async filename => {
    const extention = path.extname(filename);
    const name = path.basename(filename, extention);

    if (dictionaries[name]) {
      const lineReader = readline.createInterface({
        input: fs.createReadStream(path.join(dataDirectory, filename)),
      });

      let rank = 0;

      const tokenToRank: Dictionary<number> = {};

      for await (const line of lineReader) {
        const token = line.split(' ')[0];

        tokenToRank[token] = rank;

        rank++;
      }

      frequencyLists[name] = tokenToRank;
    } else {
      console.log(`Warning: ${name} appears in ${dataDirectory} but not in dictionary settings.`);
    }
  });

  Object.keys(dictionaries).forEach(name => {
    if (!frequencyLists[name]) {
      console.log(`Warning: ${name} appears in dictionary settings but not in ${dataDirectory} directory.`);
    }
  });

  return frequencyLists;
}

function filterFrequencyLists(lists: FrequencyLists): void {
  const filteredTokensAndRanks: Dictionary<number[]> = {};
  const tokenCount: Dictionary<number> = {};
  const minimumRank: Dictionary<number> = {};
  const minimumName: Dictionary<string> = {};

  Object.keys(lists).forEach(listName => {
    filteredTokensAndRanks[listName] = [];
    tokenCount[listName] = 0;

    const list = lists[listName];

    Object.keys(list).forEach(token => {
      const rank = list[token];

      if (!minimumRank[token] || rank < minimumRank[token]) {
        minimumRank[token] = rank;
        minimumName[token] = listName;
      }
    });
  });

}

parseFrequencyLists('data');
