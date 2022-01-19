# xref2csv

Convert XREF bibliography file (in XML) to semicolon delimited CSV for [ASreview](https://asreview.nl).

## Install dependencies

```bash
npm i
```

## Debugging

```bash
npm start
```

## Building

```bash
npm run build
```

## Usage

```bash
node dist/index.js PATH_TO_XREF/xref.xml -o dataset.csv
```

## Installation as a CLI tool

```bash
npm i -g xref2csv
xref2csv PATH_TO_XREF/xref.xml -o dataset.csv
```
