# Affiliate links that need replacing

**Checked:** 2026-09-30 — every /go/ destination promoted on the site (217 links) was tested.

**Status:** the 28 links below are dead, so their "Pelaa heti" buttons are switched off in the build (src/lib/dead-affiliates.ts). The casinos stay listed with their reviews and licence badges. Delete a slug from that file once a working link is in data/go-redirects.json and the button comes back automatically.

**Not listed here:** 80 destinations that refused our connection (403 "Country Blocked" or timeout). Operators geo-block non-Finnish traffic, so those can only be judged from Finland.

| Casino (/go/ slug) | Buttons on site | Why it fails | Current destination |
|---|---|---|---|
| `casinofest` | 3 | tracking domain gone | `https://afftrackcf.21.partners/C.ashx?btag=a_15705b_1099c_&affid=3651&siteid=157` |
| `barz` | 2 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_20072b_632c_&affid=4156&siteid=20072&a` |
| `biamobet` | 2 | tracking domain gone | `https://uhaf836f42uh.mndslkgndsf.cc/?rid=-7EBNQCgQAADC-EAAGAQEREQoRCQoRDTIRDRIAA` |
| `dreamvegas-3` | 2 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_36785b_876c_&affid=5850&siteid=36785&a` |
| `vipscasino` | 2 | tracking domain gone | `https://m.vipscasino.com/Redirect.aspx?mid=2&sid=401&cid=FI&pid=&affid=120` |
| `amunra` | 1 | tracking domain gone | `http://wlamunra.adsrv.eacdn.com/C.ashx?btag=a_291b_225c_&affid=137&siteid=291&ad` |
| `blackjack-city` | 1 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_19296b_752c_&affid=4002&siteid=19296&a` |
| `casilime` | 1 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_25225b_717c_&affid=5068&siteid=25225&a` |
| `hejgo` | 1 | destination 404 | `https://hejgoplay.com/j5166ea4e` |
| `huikee` | 1 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_19306b_619c_&affid=3976&siteid=19306&a` |
| `jupi-casino` | 1 | tracking domain gone | `https://go.yourgalaxypartners.com/visit/?bta=35395&nci=5349&utm_campaign=FI` |
| `locowin` | 1 | destination 526 | `https://aff-ads.locowin.com/v2/text/121/7/d4faf981-7d73-11ee-9fad-a299aa2f2057/1` |
| `lumi-casino` | 1 | tracking domain gone | `https://ivyaffsolutions.com/C.ashx?btag=a_28408b_746c_&affid=5850&siteid=28408&a` |
| `millonaria` | 1 | tracking domain gone | `https://play2m.com/a0da1e066` |
| `mobilebet-2` | 1 | destination 404 | `https://media.mobilebet.com/tracking.php?tracking_code&aid=107051&mid=2349&sid=3` |
| `nitro-casino` | 1 | tracking domain gone | `https://afftracknc.21.partners/C.ashx?btag=a_5996b_595c_&affid=1564&siteid=5996&` |
| `one-step-casino` | 1 | tracking domain gone | `https://wlcg-partners.adsrv.eacdn.com/C.ashx?btag=a_10605b_3505c_&affid=2539&sit` |
| `playouwin` | 1 | tracking domain gone | `https://rewrdtracker.com/trk/click?aid=522E&cid=25697&s1=FI` |
| `pronto` | 1 | tracking domain gone | `https://wlpremierlivecasino.adsrv.eacdn.com/C.ashx?btag=a_998b_14c_&affid=272&si` |
| `slothino` | 1 | tracking domain gone | `https://wlpremierlivecasino.adsrv.eacdn.com/C.ashx?btag=a_3742b_117c_&affid=808&` |
| `supernopea` | 1 | tracking domain gone | `https://media.supernopea.com/C.ashx?btag=a_6030b_157c_&affid=1419&siteid=6030&ad` |
| `svenplay` | 1 | tracking domain gone | `https://wlcg-partners.adsrv.eacdn.com/C.ashx?btag=a_2621b_1418c_&affid=1197&site` |
| `ultracasino` | 1 | tracking domain gone | `https://afftrackuc.21.partners/C.ashx?btag=a_8832b_645c_&affid=2150&siteid=8832&` |
| `vegadream` | 1 | tracking domain gone | `https://record.vegaffiliates.com/_AAhevloBXaDUOsjNOfgKeWNd7ZgqdRLk/4490/` |
| `vesper-casino` | 1 | tracking domain gone | `https://n.clm.best/id/60e6e155cde9a/7e411f2c.html` |
| `wallacebet` | 1 | tracking domain gone | `https://wlcg-partners.adsrv.eacdn.com/C.ashx?btag=a_12408b_3542c_&affid=2871&sit` |
| `wikibet` | 1 | tracking domain gone | `https://record.wikipartners.com/_pfpsr8F8w7TUOsjNOfgKeWNd7ZgqdRLk/6881/` |
| `wunderwins` | 1 | tracking domain gone | `https://record.wunderaffiliates.com/_MOjr18JvkXbUOsjNOfgKeWNd7ZgqdRLk/1/` |

**What is needed from the affiliate manager:** a current tracking URL for each casino still worth promoting. For any casino the programme has ended, say so and the casino is removed instead (same path as the 19 closed casinos).
