package handlers

import (
	"image"
	"image/color"
	stdDraw "image/draw"
	"image/png"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/font/sfnt"
	"golang.org/x/image/math/fixed"
)

// Standard Open Graph image size (1.91:1 ratio).
const (
	ogW = 1200
	ogH = 630
)

// Brand palette — matches the app's amber/parchment theme.
var (
	colBg    = color.RGBA{253, 243, 220, 255} // parchment  #FDF3DC
	colAmber = color.RGBA{180, 83, 9, 255}    // amber-700  #B45309
	colGold  = color.RGBA{251, 191, 36, 255}  // amber-400  #FBBF24 — decorative quote
	colDark  = color.RGBA{28, 25, 23, 255}    // stone-900  #1C1917
	colWhite = color.RGBA{255, 255, 255, 255}
)

// Fonts are parsed once at startup via sync.Once — OTF parsing is expensive.
var (
	ogOnce    sync.Once
	ogBoldSFNT *sfnt.Font
	ogRegSFNT  *sfnt.Font
	ogInitErr  error
)

func ogInitFonts() {
	ogOnce.Do(func() {
		ogBoldSFNT, ogInitErr = opentype.Parse(gobold.TTF)
		if ogInitErr != nil {
			return
		}
		ogRegSFNT, ogInitErr = opentype.Parse(goregular.TTF)
	})
}

func newFace(f *sfnt.Font, pt float64) (font.Face, error) {
	return opentype.NewFace(f, &opentype.FaceOptions{
		Size:    pt,
		DPI:     96,
		Hinting: font.HintingFull,
	})
}

// ogFill fills rect r with colour c.
func ogFill(dst stdDraw.Image, r image.Rectangle, c color.Color) {
	stdDraw.Draw(dst, r, image.NewUniform(c), image.Point{}, stdDraw.Src)
}

// ogMeasure returns the advance width of s in whole pixels.
func ogMeasure(face font.Face, s string) int {
	d := &font.Drawer{Face: face}
	return int(d.MeasureString(s) >> 6)
}

// ogDraw renders s at pixel baseline (x, y).
func ogDraw(dst stdDraw.Image, face font.Face, col color.Color, s string, x, y int) {
	(&font.Drawer{
		Dst:  dst,
		Src:  image.NewUniform(col),
		Face: face,
		Dot:  fixed.Point26_6{X: fixed.I(x), Y: fixed.I(y)},
	}).DrawString(s)
}

// ogCenter renders s centred horizontally at baseline y.
func ogCenter(dst stdDraw.Image, face font.Face, col color.Color, s string, y int) {
	x := (ogW - ogMeasure(face, s)) / 2
	if x < 0 {
		x = 0
	}
	ogDraw(dst, face, col, s, x, y)
}

// ogWrap splits text into lines that fit within maxW pixels.
func ogWrap(face font.Face, text string, maxW int) []string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return nil
	}
	d := &font.Drawer{Face: face}
	spaceW := d.MeasureString(" ")

	var lines []string
	var cur strings.Builder
	var curW fixed.Int26_6

	for i, word := range words {
		ww := d.MeasureString(word)
		if i == 0 {
			cur.WriteString(word)
			curW = ww
			continue
		}
		if int((curW+spaceW+ww)>>6) <= maxW {
			cur.WriteByte(' ')
			cur.WriteString(word)
			curW += spaceW + ww
		} else {
			lines = append(lines, cur.String())
			cur.Reset()
			cur.WriteString(word)
			curW = ww
		}
	}
	if cur.Len() > 0 {
		lines = append(lines, cur.String())
	}
	return lines
}

func lineH(face font.Face) int {
	h := int(face.Metrics().Height >> 6)
	if h == 0 {
		h = 40
	}
	return h
}

// buildOGImage renders a 1200×630 brand card for the given verse.
func buildOGImage(verseText, reference, version string) (image.Image, error) {
	ogInitFonts()
	if ogInitErr != nil {
		return nil, ogInitErr
	}

	// Scale verse font size down for longer texts.
	versePt := 30.0
	switch {
	case len(verseText) > 350:
		versePt = 20.0
	case len(verseText) > 250:
		versePt = 24.0
	case len(verseText) > 150:
		versePt = 27.0
	}

	headerFace, err := newFace(ogBoldSFNT, 36)
	if err != nil {
		return nil, err
	}
	defer headerFace.Close()

	refFace, err := newFace(ogBoldSFNT, 26)
	if err != nil {
		return nil, err
	}
	defer refFace.Close()

	footerFace, err := newFace(ogBoldSFNT, 22)
	if err != nil {
		return nil, err
	}
	defer footerFace.Close()

	quoteFace, err := newFace(ogBoldSFNT, 84)
	if err != nil {
		return nil, err
	}
	defer quoteFace.Close()

	verseFace, err := newFace(ogRegSFNT, versePt)
	if err != nil {
		return nil, err
	}
	defer verseFace.Close()

	img := image.NewRGBA(image.Rect(0, 0, ogW, ogH))

	// ── Background ────────────────────────────────────────────────────────────
	ogFill(img, image.Rect(0, 0, ogW, ogH), colBg)

	// ── Top amber bar (0–80) ──────────────────────────────────────────────────
	const topH = 80
	ogFill(img, image.Rect(0, 0, ogW, topH), colAmber)
	ogCenter(img, headerFace, colWhite, "Words of Praise\u2122", topH-18)

	// ── Bottom amber bar (572–630) ────────────────────────────────────────────
	const botH = 58
	ogFill(img, image.Rect(0, ogH-botH, ogW, ogH), colAmber)
	ogCenter(img, footerFace, colWhite, "wordsofpraise.app", ogH-17)

	// ── Decorative opening quote mark ─────────────────────────────────────────
	ogDraw(img, quoteFace, colGold, "\u201C", 64, topH+76)

	// ── Verse text (word-wrapped, centred) ────────────────────────────────────
	const padX = 100
	lines := ogWrap(verseFace, verseText, ogW-2*padX)
	lh := lineH(verseFace)
	refLH := lineH(refFace) + 12

	// Vertically centre the verse block + reference within the content zone.
	contentMid := topH + (ogH-topH-botH)/2
	blockH := len(lines)*lh + refLH
	firstY := contentMid - blockH/2 + lh

	for i, line := range lines {
		ogCenter(img, verseFace, colDark, line, firstY+i*lh)
	}

	// ── Reference ─────────────────────────────────────────────────────────────
	ref := "\u2014 " + reference
	if version != "" && version != "KJV" {
		ref += " (" + version + ")"
	}
	ogCenter(img, refFace, colAmber, ref, firstY+len(lines)*lh+refLH)

	return img, nil
}

// GetDailyVerseOG serves a 1200×630 PNG Open Graph image for today's verse.
// GET /api/og/daily
func (h *VerseHandler) GetDailyVerseOG(c *gin.Context) {
	verse, err := h.dailyVerseService.GetDailyVerse()
	if err != nil {
		log.Printf("GetDailyVerseOG: get verse: %v", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	img, err := buildOGImage(verse.Text, verse.Reference, verse.Version)
	if err != nil {
		log.Printf("GetDailyVerseOG: render: %v", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	// Cache 1 hour — verse changes daily but stays consistent within a day.
	c.Header("Cache-Control", "public, max-age=3600")
	c.Header("Content-Type", "image/png")
	if err := png.Encode(c.Writer, img); err != nil {
		log.Printf("GetDailyVerseOG: png encode: %v", err)
	}
}
