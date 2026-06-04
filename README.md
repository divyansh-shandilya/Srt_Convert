# SRT Convert

A lightweight, flexible command-line tool for converting SubRip (.srt) subtitle files to multiple formats and vice versa.

## Features

- **Multiple Format Support**: Convert between SRT, VTT, SSA/ASS, SBV, and JSON
- **Batch Processing**: Convert multiple files at once
- **Customizable Output**: Configure timing adjustments, encoding, and formatting options
- **Lossless Conversion**: Preserves subtitle timing and content accuracy
- **Encoding Support**: UTF-8, UTF-16, and various other character encodings
- **Timeline Shift**: Adjust subtitle timing by milliseconds or seconds
- **Filter & Search**: Extract subtitles by time range or text content
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### From npm

```bash
npm install -g srt-convert
```

### From source

```bash
git clone https://github.com/yourusername/srt-convert.git
cd srt-convert
npm install
npm link
```

### Docker

```bash
docker run -v $(pwd):/data srt-convert <command> <options>
```

## Quick Start

### Basic Conversion

Convert SRT to VTT:
```bash
srt-convert input.srt output.vtt
```

Convert any format to SRT:
```bash
srt-convert input.vtt output.srt
```

### Batch Processing

Convert all SRT files in a directory:
```bash
srt-convert --batch ./subtitles --output-format vtt
```

## Usage

### Command Line

```bash
srt-convert [input] [output] [options]
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--format` | `-f` | Output format (srt, vtt, ssa, sbv, json) | auto-detect |
| `--encoding` | `-e` | Output encoding (utf-8, utf-16, latin1, etc.) | utf-8 |
| `--shift` | `-s` | Shift timing by milliseconds (positive or negative) | 0 |
| `--start-index` | | Start subtitle numbering from this value | 1 |
| `--remove-styles` | | Strip formatting tags from output | false |
| `--filter-start` | | Only include subtitles after this timestamp (HH:MM:SS) | - |
| `--filter-end` | | Only include subtitles before this timestamp (HH:MM:SS) | - |
| `--batch` | `-b` | Process all files in directory | false |
| `--preserve-metadata` | `-p` | Keep original metadata in output | true |
| `--strict` | | Enable strict parsing mode | false |
| `--verbose` | `-v` | Show detailed processing information | false |

## Examples

### Convert with timing adjustment

Shift all subtitles forward by 2.5 seconds:
```bash
srt-convert movie.srt movie-adjusted.srt --shift 2500
```

### Extract subtitles from time range

Extract subtitles between 10 and 20 minutes:
```bash
srt-convert full-subtitles.srt excerpt.srt --filter-start 00:10:00 --filter-end 00:20:00
```

### Convert to JSON for programmatic use

```bash
srt-convert subtitles.srt subtitles.json
```

Output format:
```json
{
  "subtitles": [
    {
      "index": 1,
      "startTime": "00:00:01,000",
      "endTime": "00:00:03,500",
      "text": "Subtitle text here"
    }
  ]
}
```

### Remove styling and convert to VTT

```bash
srt-convert styled.srt clean.vtt --remove-styles
```

### Batch convert with different encoding

```bash
srt-convert --batch ./subtitles --format vtt --encoding utf-16
```

## Supported Formats

### Input Formats
- **SRT** (SubRip) - .srt
- **VTT** (WebVTT) - .vtt
- **SSA/ASS** (Advanced SubStation) - .ssa, .ass
- **SBV** (YouTube) - .sbv
- **JSON** - .json

### Output Formats
- SRT (SubRip)
- VTT (WebVTT)
- SSA/ASS (Advanced SubStation)
- SBV (YouTube)
- JSON

## API Usage

Use srt-convert as a Node.js module:

```javascript
const SrtConvert = require('srt-convert');

// Convert file
SrtConvert.convertFile('input.srt', 'output.vtt', {
  shift: 2500,
  encoding: 'utf-8',
  removeStyles: false
}).then(() => {
  console.log('Conversion complete');
}).catch(err => {
  console.error('Conversion failed:', err);
});

// Convert string
const srtContent = `1
00:00:01,000 --> 00:00:03,500
Hello World`;

SrtConvert.convertString(srtContent, 'srt', 'vtt')
  .then(vttContent => console.log(vttContent));
```

## Configuration File

Create a `.srtconvertrc.json` file in your project for default options:

```json
{
  "format": "vtt",
  "encoding": "utf-8",
  "removeStyles": false,
  "shift": 0,
  "startIndex": 1
}
```

## Common Use Cases

### YouTube Subtitles
Convert YouTube SBV files to SRT for general use:
```bash
srt-convert youtube-video.sbv youtube-video.srt
```

### Video Editor Compatibility
Convert to SSA format for subtitle editing software:
```bash
srt-convert video.srt video.ssa
```

### Web Deployment
Convert to VTT for HTML5 video players:
```bash
srt-convert video.srt video.vtt
```

### Timing Synchronization
If subtitles are out of sync with video:
```bash
srt-convert out-of-sync.srt synchronized.srt --shift -500
```

## Troubleshooting

### "Cannot parse file" error
- Ensure file encoding is UTF-8 or supported by the tool
- Check that file format matches the actual content
- Use `--strict` mode disabled for more lenient parsing

### Garbled characters in output
- Specify output encoding: `--encoding utf-8`
- Try a different encoding if the default doesn't work

### Timing issues
- Verify timing format is correct: HH:MM:SS,mmm
- Check video player supports the subtitle format

### Performance with large files
- Use batch processing for multiple files
- Consider splitting very large subtitle files

## Performance Metrics

- Process ~1,000 subtitle lines per second
- Memory usage: <50MB for files under 10,000 subtitles
- Batch processing: ~10 files/second

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

soon :)

## Changelog

### v1.0.0
- Initial release
- Support for SRT, VTT, SSA/ASS, SBV, and JSON formats
- Batch processing capability
- Timing adjustment features
- Full filtering support

## FAQ

**Q: Does srt-convert support .sub files?**  
A: We currently support the formats listed above. .SUB files have multiple formats; please convert to SRT or VTT first.

**Q: Can I use this for commercial projects?**  
A: Yes, the MIT license permits commercial use.

**Q: Is there a GUI version?**  
A: Currently, srt-convert is CLI-only, but a web interface is planned for future releases.

**Q: How accurate is the conversion?**  
A: We aim for 100% lossless conversion. Any issues are considered bugs.

---

**Made with ❤️ by the SRT Convert Team**
