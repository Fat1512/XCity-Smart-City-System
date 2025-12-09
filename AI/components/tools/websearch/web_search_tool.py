# -----------------------------------------------------------------------------
# Copyright 2025 Fenwick Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------
from components.interfaces import Tool
from ddgs import DDGS
import trafilatura
import concurrent.futures
from urllib.parse import urlparse

class WebSearchTool(Tool):
    name = "web_search"
    description = "web search with trusted domains"

    TRUSTED_DOMAINS = [
        "vnexpress.net",
        "tuoitre.vn",
        "thanhnien.vn",
        "vov.vn",
        "chinhphu.vn",
        "hochiminhcity.gov.vn",
        "baochinhphu.vn",
        "laodong.vn",
        "dantri.com.vn",
        "vietnamnet.vn",
        "sggp.org.vn", 
        "nld.com.vn",
    ]

    BLACKLIST_DOMAINS = [
        "youtube.com", "facebook.com", "tiktok.com", "instagram.com",
        "shopee.vn", "lazada.vn", "tiki.vn", "pinterest.com"
    ]

    def call(self, query: str, max_results: int = 5) -> str:
        top_domains = self.TRUSTED_DOMAINS[:6]
        
        site_operators = " OR ".join([f"site:{d}" for d in top_domains])
        
        enhanced_query = f"{query} ({site_operators})"

        print(f"[WebSearch] Searching: {enhanced_query}")
        
        try:
            results = DDGS().text(enhanced_query, region="vn-vn", max_results=8)
            
            if not results:
                print("[WebSearch] Strict search failed. Falling back to broad search...")
                results = DDGS().text(query, region="vn-vn", max_results=8)

            if not results:
                return ""
            
            final_context = "KẾT QUẢ TÌM KIẾM WEB (NGUỒN TIN CẬY):\n\n"
            collected_sources = []
            
            links_to_scrape = []
            
            for res in results:
                url = res.get('href', '')
                if not url: continue
                
                domain = self._get_domain(url)
                
                if any(bl in domain for bl in self.BLACKLIST_DOMAINS):
                    continue
                
                links_to_scrape.append(res)
                if len(links_to_scrape) >= 3:
                    break

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                future_to_res = {executor.submit(self._scrape_content, res): res for res in links_to_scrape}
                
                for future in concurrent.futures.as_completed(future_to_res):
                    res = future_to_res[future]
                    full_content = future.result()
                    
                    title = res.get('title', 'No Title')
                    link = res.get('href', '#')
                    collected_sources.append({
                        "title": title,
                        "url": link,
                        "type": "web"
                    })
                    
                    if full_content and len(full_content) > 150:
                        content_show = full_content[:1500].replace("\n", " ") + "..."
                        source_note = "(Chi tiết)"
                    else:
                        content_show = res.get('body') or res.get('snippet') or ""
                        source_note = "(Tóm tắt)"

                    final_context += f"=== Nguồn: {title} ===\nLink: {link} {source_note}\nNội dung: {content_show}\n\n"
            
            return {
                "context": final_context,
                "sources": collected_sources
            }

        except Exception as e:
            print(f"[WebSearch] Error: {e}")
            return ""

    def _scrape_content(self, result_item):
        url = result_item.get('href')
        if not url: return None
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                return trafilatura.extract(downloaded, include_comments=False, include_tables=True)
        except Exception:
            return None
        return None

    def _get_domain(self, url):
        try:
            return urlparse(url).netloc.replace("www.", "")
        except:
            return ""