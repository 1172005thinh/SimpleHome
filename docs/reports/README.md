# Huong dan build PDF (XeLaTeX + latexmk)

Tai lieu trong thu muc nay duoc build bang `latexmk` va `xelatex`.

## 1) Di chuyen vao thu muc reports

```bash
cd /opt/docker/simplehome/docs/reports
```

## 2) Build file PDF

```bash
latexmk -pdf -xelatex -interaction=nonstopmode -shell-escape main.tex
```

## 3) File ket qua

Sau khi build thanh cong, file output la:

- `main.pdf`

## (Tuy chon) Don file tam

```bash
latexmk -c
```

Neu muon don ca file PDF:

```bash
latexmk -C
```
