// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
import { useState, useEffect } from "react";
import {
  Camera,
  Activity,
  Wind,
  AlertTriangle,
  BarChart3,
  Bot,
  ArrowRight,
  Github,
  Menu,
  X,
  ChevronRight,
  Zap,
  Globe,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo";

const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(226, 232, 240, 0.5) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(226, 232, 240, 0.5) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(to bottom, transparent, black, transparent);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
  }
  .reveal.active {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    const revealElements = document.querySelectorAll(".reveal");
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 150;
      revealElements.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", revealOnScroll);

    revealOnScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", revealOnScroll);
    };
  }, []);

  const features = [
    {
      icon: Camera,
      title: "AI Vision Traffic",
      description:
        "Phân tích lưu lượng realtime bằng YOLO, cảnh báo tắc đường và gợi ý tuyến đi tối ưu.",
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "group-hover:from-blue-500 group-hover:to-cyan-400",
    },
    {
      icon: Wind,
      title: "Enviro Monitor",
      description:
        "Kết nối sensor IoT & API OpenAQ theo dõi chất lượng không khí, cảnh báo ô nhiễm.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "group-hover:from-emerald-500 group-hover:to-green-400",
    },
    {
      icon: AlertTriangle,
      title: "Smart Alert",
      description:
        "Hệ thống cảnh báo tai nạn, thiên tai tức thời tới cư dân và trung tâm điều hành.",
      color: "text-amber-500",
      bg: "bg-amber-50",
      gradient: "group-hover:from-amber-500 group-hover:to-orange-400",
    },
    {
      icon: BarChart3,
      title: "Data Dashboard",
      description:
        "Trực quan hóa dữ liệu lớn, hỗ trợ ra quyết định thông minh dựa trên data thực.",
      color: "text-purple-600",
      bg: "bg-purple-50",
      gradient: "group-hover:from-purple-500 group-hover:to-indigo-400",
    },
    {
      icon: Activity,
      title: "IoT Infrastructure",
      description:
        "Giám sát sức khỏe hạ tầng đô thị 24/7, phát hiện sớm sự cố để bảo trì.",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      gradient: "group-hover:from-indigo-500 group-hover:to-blue-400",
    },
    {
      icon: Bot,
      title: "City AI Assistant",
      description:
        "Chatbot thông minh hỗ trợ giải đáp thủ tục hành chính và hướng dẫn du lịch.",
      color: "text-rose-500",
      bg: "bg-rose-50",
      gradient: "group-hover:from-rose-500 group-hover:to-pink-400",
    },
  ];

  const stats = [
    { number: "100%", label: "Mã nguồn mở", icon: Github },
    { number: "24/7", label: "Giám sát Realtime", icon: Activity },
    { number: "4.0", label: "Công nghệ AI & IoT", icon: Cpu },
    { number: "∞", label: "Khả năng mở rộng", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-green-200">
      <style>{customStyles}</style>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.6]"></div>

        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrollY > 20
            ? "bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8  mx-auto">
          <div className="grid grid-cols-12 justify-between items-center">
            <div className="cursor-pointer col-span-3">
              <Logo />
            </div>

            <div className="hidden md:flex items-center col-span-6 col-start-4 justify-center space-x-10 font-medium">
              {[
                { name: "Tính năng", target: "features" },
                { name: "Giới thiệu", target: "about-us" },
                { name: "Liên hệ", target: "contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={`#${item.target}`}
                  className="
        relative text-sm font-semibold uppercase tracking-wide text-slate-600 
        transition-all duration-300 hover:text-slate-900
      "
                >
                  {item.name}

                  <span
                    className="
          absolute left-1/2 -bottom-1 h-0.5 w-0 
          bg-linear-to-r from-green-400 to-green-600 
          transition-all duration-300 
          group-hover:opacity-100 
          group-hover:w-full 
          group-hover:left-0
        "
                  />
                </a>
              ))}
            </div>

            <div className="flex ml-auto col-span-3 items-center gap-4">
              <a
                href="https://github.com/Fat1512/XCity-Smart-City-System"
                className="hidden cursor-pointer sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-full transition-all shadow-lg hover:shadow-slate-900/30 hover:-translate-y-0.5 font-medium text-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            {[
              { name: "Tính năng", target: "features" },
              { name: "Giới thiệu", target: "about-us" },
              { name: "Liên hệ", target: "lien-he" },
            ].map((item) => (
              <a
                key={item.name}
                href={`#${item.target}`}
                className="
                block px-4 py-3 rounded-xl
                text-slate-700 font-semibold
                hover:bg-green-100/60 hover:text-green-700
                transition-all duration-300
                active:scale-[0.98]
              "
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-green-100 text-green-700 text-sm font-semibold mb-8 animate-float cursor-pointer hover:bg-white hover:shadow-md transition-all backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Phiên bản X-City 1.0 Released
            <ChevronRight className="w-4 h-4 text-green-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Kiến tạo đô thị <br className="hidden sm:block" />
            <span className="bg-linear-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Thông Minh & Bền Vững
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed reveal active">
            Nền tảng mã nguồn mở tích hợp sức mạnh của{" "}
            <span className="font-semibold text-slate-900">AI Vision</span> và{" "}
            <span className="font-semibold text-slate-900">IoT</span>, biến dữ
            liệu thô thành hành động thực tế.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 reveal active">
            <button
              onClick={() => navigate("/map")}
              className="group relative px-8 py-4 bg-green-600 text-white rounded-full font-bold shadow-[0_10px_40px_-10px_rgba(22,163,74,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(22,163,74,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
              <span className="flex items-center gap-2">
                Khám phá ngay{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-white hover:border-green-200 hover:text-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Live Demo
            </button>
          </div>

          <div className="relative group perspective-1000">
            <div className="absolute -inset-2 bg-linear-to-r from-green-400 via-teal-400 to-emerald-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative rounded-2xl overflow-hidden border border-white/50 bg-white/40 backdrop-blur-md shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
              <div className="h-10 bg-white/50 border-b border-white/20 flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              <div className="aspect-video bg-slate-50 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <img
                    src="./banner.png"
                    alt="Dashboard Preview"
                    className="w-full h-full object-fit opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-y border-slate-200 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center text-center group cursor-default"
              >
                <div className="mb-2 p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                  <stat.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <h2 className="text-green-600 font-bold tracking-widest uppercase text-xs mb-4">
              Hệ Sinh Thái Toàn Diện
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Công nghệ tiên phong cho cuộc sống tốt hơn
            </h3>
            <p className="text-lg text-slate-600">
              X-City cung cấp bộ giải pháp full-stack từ phần cứng IoT đến nền
              tảng Cloud AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white border border-slate-200/60 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 reveal"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div
                  className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-green-700 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>

                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto relative z-10 reveal">
          <div className="bg-linear-to-br from-green-900 via-emerald-800 to-green-900 rounded-[2.5rem] p-8 sm:p-20 text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/30 rounded-full blur-[100px] group-hover:bg-green-400/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
                Sẵn sàng xây dựng <br /> thành phố tương lai?
              </h2>
              <p className="text-lg sm:text-xl text-green-100/90 mb-10 max-w-2xl mx-auto">
                Tham gia cộng đồng mã nguồn mở X-City ngay hôm nay để đóng góp
                vào sự phát triển bền vững của đô thị Việt Nam.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-8 py-4 bg-white text-green-900 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Liên hệ hợp tác
                </button>
                <button className="px-8 py-4 bg-green-800/50 backdrop-blur-md text-white border border-green-400/30 rounded-xl font-bold hover:bg-green-700/50 transition-colors flex items-center justify-center gap-2">
                  <Github className="w-5 h-5" />
                  Đóng góp Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Logo />

              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Giải pháp đô thị thông minh mã nguồn mở hàng đầu Việt Nam. Kết
                nối công nghệ và con người vì một tương lai xanh.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    AI Vision
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    IoT Hub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    City Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors"
                  >
                    Tuyển dụng
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © 2025 Fenwick Team. Made with{" "}
              <span className="text-red-500 animate-pulse">♥</span> in Vietnam.
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-slate-400 hover:text-slate-900 transition-transform hover:scale-110"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-500 transition-transform hover:scale-110"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
