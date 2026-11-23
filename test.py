import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.connect_over_cdp("http://localhost:29229")
        ctx=b.contexts[0]; pg=await ctx.new_page()
        await pg.set_viewport_size({"width":1200,"height":900})
        errs=[]
        pg.on("pageerror",lambda e:errs.append("PAGEERR "+str(e)))
        pg.on("console",lambda m:errs.append("CONSOLE "+m.text) if m.type=="error" else None)
        await pg.goto("file:///home/ubuntu/epi-quest/dist/EpiQuest.html"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path="shots/home.png")
        for t in ["intel","diseases","games","formulas","vaccines","career"]:
            await pg.evaluate(f"go('{t}')"); await pg.wait_for_timeout(3500 if t=="intel" else 700)
            await pg.screenshot(path=f"shots/{t}.png",full_page=(t=="intel"))
        ids=await pg.evaluate("GAMES.map(g=>g.id)")
        for gid in ids:
            await pg.evaluate(f"startGame('{gid}')"); await pg.wait_for_timeout(700)
            # click first option a few times
            for k in range(3):
                o=await pg.query_selector("#mbox .opt:not([disabled])")
                if o:
                    await o.click(); await pg.wait_for_timeout(300)
                n=await pg.query_selector("#nx")
                if n: await n.click(); await pg.wait_for_timeout(300)
            if gid in ("outbreak","herd","sprint","parent","memory"):
                if gid=="herd":
                    await pg.click("#hgo"); await pg.wait_for_timeout(4000)
                await pg.screenshot(path=f"shots/g_{gid}.png")
            await pg.evaluate("closeModal()")
        await pg.evaluate("openDisease('ebola')"); await pg.wait_for_timeout(500); await pg.screenshot(path="shots/ebola.png"); await pg.evaluate("closeModal()")
        await pg.evaluate("openWheel()"); await pg.wait_for_timeout(500); await pg.click("#spinb"); await pg.wait_for_timeout(2500); await pg.screenshot(path="shots/wheel.png")
        await pg.wait_for_timeout(3000); await pg.evaluate("closeModal()")
        await pg.set_viewport_size({"width":390,"height":844}); await pg.evaluate("go('home')"); await pg.wait_for_timeout(800); await pg.screenshot(path="shots/mobile.png")
        print("\n".join(errs) or "NO ERRORS")
        await pg.close()
asyncio.run(main())
