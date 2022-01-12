import { exit } from 'process';
import { existsSync, createReadStream, createWriteStream } from 'fs';
import { resolve } from 'path';
import commandLineArgs, { OptionDefinition } from 'command-line-args';
import stripBomStream from 'strip-bom-stream';
import Saxy from 'saxy';
import { isOK, noHtml } from './utils.js';

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'file', type: String, defaultOption: true },
  { name: 'output', alias: 'o', type: String },
] as OptionDefinition[];

type Options = {
  file: string;
  output?: string;
  verbose?: boolean;
};

const options = commandLineArgs(optionDefinitions) as Options;

if (!options.file) {
  console.error('No XML file present. See usage instructions.');
  exit(1);
}

const { file } = options;
const xmlFile = existsSync(file) ? file : resolve(process.cwd(), file);

if (file !== xmlFile && !existsSync(xmlFile)) {
  console.error(`XML file not found: ${xmlFile}. See usage instructions.`);
  exit(1);
}

const { output: outputFile = 'xref.csv' } = options;

const parser = new Saxy.Saxy();

type CsvOutput = {
  record_id?: number;
  title: string;
  abstract: string;
  keywords?: string;
  authors?: string;
  doi?: string;
  included?: 0 | 1;
};

const fieldsOfInterest = ['TTZ', 'ABS', 'TRC', 'AUT', 'NAU', 'LIN', 'URL', 'UNT'];

let output: CsvOutput;
let includeDoc = false;
let key = '';
let txt = '';
let arrayResult = false;
let array: string[] = [];

// Called whenever an opening tag is found in the document,
// such as <example id="1" /> - see below for a list of events
parser.on('tagopen', (tag) => {
  // console.log(`Open tag "${tag.name}" with attributes: ${tag.attrs}.`);
  // console.log(
  //   `Open tag "${tag.name}" with attributes: ${JSON.stringify(Saxy.parseAttrs(tag.attrs))}.`
  // );
  switch (tag.name) {
    case 'doc': {
      const { id } = Saxy.parseAttrs(tag.attrs);
      if (typeof id === 'string') output = { record_id: +id } as CsvOutput;
      return;
    }
    case 'field': {
      if (tag.isSelfClosing) return;
      const { id } = Saxy.parseAttrs(tag.attrs);
      if (typeof id === 'string' && fieldsOfInterest.indexOf(id) >= 0) {
        key = id;
      }
      return;
    }
    case 'phrase': {
      if (key) arrayResult = true;
      return;
    }
    case 'a': {
      if (key !== 'LIN') return;
      const { href } = Saxy.parseAttrs(tag.attrs);
      key = '';
      if (typeof href === 'string') output.doi = noHtml(href);
      return;
    }
  }
});

let counter = 0;
const units = new Set(['DSS', 'HEAL', 'IND', 'SAP', 'ICT', 'ET', 'TT', 'BIM', 'CEE', 'ENG']);

parser.on('tagclose', (tag) => {
  if (key && tag.name === 'field') {
    switch (key) {
      case 'TTZ': {
        output.title = noHtml(txt);
        break;
      }
      case 'ABS': {
        output.abstract = noHtml(txt);
        break;
      }
      case 'TRC': {
        if (array.length === 0) break;
        const keywords = array.join(', ');
        output.keywords = output.keywords ? `${output.keywords}, ${keywords}` : keywords;
        array = [];
        break;
      }
      case 'AUT': {
        output.authors = array.join(', ');
        array = [];
        break;
      }
      case 'URL': {
        output.doi = output.doi || noHtml(txt);
        break;
      }
      case 'UNT': {
        const words = new Set(txt.split(/ /));
        const intersection = new Set([...units].filter((x) => words.has(x)));
        if (!intersection) break;
        const keywords = [...intersection].join(', ');
        output.keywords = output.keywords ? `${output.keywords}, ${keywords}` : keywords;
        break;
      }
    }
    txt = '';
    key = '';
    return;
  }
  if (tag.name !== 'doc' || !includeDoc || !output.abstract) return;
  if (counter === 0) {
    parser.push(
      ['record_id', 'title', 'abstract', 'keywords', 'authors', 'doi', 'included'].join(';') + '\n'
    );
  }
  const { record_id, title, abstract, keywords, authors, doi, included } = output;
  parser.push(
    [record_id, title, abstract, keywords, authors, doi, included]
      .map((s) => (s ? s.toString().replace(/;/g, ' ').replace(/"/g, "'") : s))
      .join(';') + '\n'
  );
  counter++;
});

parser.on('text', (text) => {
  if (!key) return;
  const t = text.contents.trim();
  if (key === 'NAU') {
    key = '';
    includeDoc = isOK.test(t);
    return;
  }
  if (arrayResult) {
    arrayResult = false;
    if (key === 'LIN') {
      output.doi = noHtml(t);
      return;
    }
    t && array.push(t);
    return;
  }
  if (key === 'LIN') {
    return;
  }
  txt = t;
});

// Called when we are done parsing the document
parser.on('finish', () => {
  console.log(`Finished parsing ${counter} articles.`);
});

const csvStream = createWriteStream(outputFile, { encoding: 'utf-8' });
createReadStream(xmlFile, { encoding: 'utf16le' })
  .pipe(stripBomStream())
  .pipe(parser)
  .pipe(csvStream);
