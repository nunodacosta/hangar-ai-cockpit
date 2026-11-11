# Gera icon.svg + PNG/ICO (variantes para tema escuro e claro) a partir dos mesmos parâmetros
from PIL import Image, ImageDraw
DY = 3                                   # centragem vertical do conjunto
CHEV = [(10,14),(20,23),(10,32)]; UND = [(9,41),(21,41)]; SW = 5      # _ por baixo do >
BIG = (44,37,14); SMALL = (53,15,6.5)     # estrela grande: canto inferior direito
def sp(cx,cy,r):
    o=.19*r; f=lambda v:round(v,3)
    return f"M{f(cx)} {f(cy-r)}Q{f(cx+o)} {f(cy-o)} {f(cx+r)} {f(cy)}Q{f(cx+o)} {f(cy+o)} {f(cx)} {f(cy+r)}Q{f(cx-o)} {f(cy+o)} {f(cx-r)} {f(cy)}Q{f(cx-o)} {f(cy-o)} {f(cx)} {f(cy-r)}Z"
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x=".75" y=".75" width="62.5" height="62.5" rx="14" fill="#12151c" stroke="#3a4256" stroke-width="1.5"/><g transform="translate(0 {DY})"><path d="M{CHEV[0][0]} {CHEV[0][1]}L{CHEV[1][0]} {CHEV[1][1]}L{CHEV[2][0]} {CHEV[2][1]}M{UND[0][0]} {UND[0][1]}H{UND[1][0]}" fill="none" stroke="#fff" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round"/><path fill="#fff" d="{sp(*BIG)}"/><path fill="#fff" d="{sp(*SMALL)}"/></g></svg>'''
open('public/icon.svg','w').write(svg)
S=2048;k=S/64
def make(col):
    im=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(im)
    d.rounded_rectangle((0,0,S-1,S-1),radius=int(S*14/64),fill=(58,66,86,255))
    b=int(1.5*k);d.rounded_rectangle((b,b,S-1-b,S-1-b),radius=int(S*13/64),fill=(18,21,28,255))
    w=int(SW*k);P=lambda p:(p[0]*k,(p[1]+DY)*k)
    def line(pts):
        pts=[P(p) for p in pts];d.line(pts,fill='white',width=w,joint='curve')
        for p in pts:d.ellipse((p[0]-w/2,p[1]-w/2,p[0]+w/2,p[1]+w/2),fill='white')
    line(CHEV);line(UND)
    def q(a,c,b,n=24):return [((1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b[1]) for t in [i/n for i in range(n)]]
    def star(cx,cy,r):
        o=.19*r;pts=[]
        T=(cx,cy-r);R=(cx+r,cy);B=(cx,cy+r);L=(cx-r,cy)
        for a,c,e in ((T,(cx+o,cy-o),R),(R,(cx+o,cy+o),B),(B,(cx-o,cy+o),L),(L,(cx-o,cy-o),T)):pts+=q(a,c,e)
        d.polygon([(x*k,(y+DY)*k) for x,y in pts],fill=col)
    star(*BIG);star(*SMALL);return im
dark=make((255,255,255,255))
sz=[(256,256),(128,128),(64,64),(48,48),(32,32),(24,24),(16,16)]
dark.resize((256,256),Image.LANCZOS).save('build/icon.ico',sizes=sz)
dark.resize((512,512),Image.LANCZOS).save('build/icon.png');dark.resize((512,512),Image.LANCZOS).save('public/icon-512.png')
