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

The XML input contains many `doc` records, like the one below. ASreview requires a CSV with the following headers (either using commas or, in this case, semicolons to separate columns):
`record_id; title; abstract; keywords; authors; doi; included`. The used mapping is as follows:

- `record_id`: Document id
- `title`: `TTZ`
- `abstract`: `ABS` or `SAM` (from the Dutch word `samenvatting`)
- `keywords`: `TRC`
- `authors`: `AUT`
- `doi`: `LIN` or `URL` fields

HTML that may be present in the XML is removed, as well as `<phrase>...</phrase>` elements (i.e. the XML, not the content).

Something that is specific to our datasets is that the `NAU` field must be present and must contain `ja`. However, by default, this check is turned off, but you can enable it via the command line (option `-s`).

Additionally, the unit that created the results, specified by the field with id `UNT`, is added as keyword. Potentially, adding the research group `RSG` could be valuable too, but this is not done.

```xml
<?xml version="1.0" encoding="Unicode"?>
<root>
  <docs>
    <doc id="877707" created="22-6-2020 15:51:11" modified="24-3-2021 14:02:37">
      <field id="ID">877707</field>
      <field id="AWL">202006</field>
      <field id="LIN">
        <phrase>
          <a href="https://website.nl/bibliotheek/sv/TNO/Publicaties/2019/hendriks-2019-interoperability.pdf">https://website.nl/bibliotheek/sv/TNO/Publicaties/2019/hendriks-2019-interoperability.pdf</a>
        </phrase>
      </field>
      <field id="ABS">In the Crisis Management (CM) domain, there is a need for quickly setting up a trial or exercise to test or train new or existing CM solutions and procedures. The EU-funded DRIVER+ project developed an open source cloudbased simulation framework, which provides a quick and easy way to connect simulators and (C2-like) solutions in such a way that they can efficiently exchange information between each other, and between simulators and solutions. It has already been used successfully in three CM trials, and in several Military battle labs proof-of-concepts.</field>
      <field id="ANN">DRIVER+ project</field>
      <field id="AUT">
        <phrase>Hendriks, M.</phrase>
        <phrase>Vullings, H.J.L.M.</phrase>
        <phrase>Campen, S. van</phrase>
        <phrase>Hameete, P.</phrase>
      </field>
      <field id="BRT">ITEC 2019</field>
      <field id="KPL">42022121</field>
      <field id="RSG">MSG</field>
      <field id="UNT">DSS</field>
      <field id="CREATED">22-6-2020</field>
      <field id="MODIFIED">24-3-2021</field>
      <field id="LOC">Den Haag Waalsdorp</field>
      <field id="MED">Elektronisch</field>
      <field id="JVP">2019</field>
      <field id="KWA">Peer_reviewed</field>
      <field id="MAT">Artikel-proceedings ; TNOpublicatie</field>
      <field id="EXS">Rep20200629</field>
      <field id="NAU">Ja</field>
      <field id="NAT">Ja</field>
      <field id="NET">Ja</field>
      <field id="NEU">Nee</field>
      <field id="PNR">060.20854 DRIVER+</field>
      <field id="TAA">Engels</field>
      <field id="TRC">
        <phrase>driver+ project</phrase>
      </field>
      <field id="TTZ">An interoperability Framework for Trials and Exercises</field>
    </doc>
  </docs>
</root>
```

```bash
node dist/index.js PATH_TO_XREF/xref.xml -o dataset.csv
```

## Installation as a CLI tool

```bash
npm i -g xref2csv
xref2csv PATH_TO_XREF/xref.xml -o dataset.csv
```
