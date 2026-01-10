import { Home, Mail, MapPin, Phone } from "lucide-react";
import type { SiteContent } from "@shared/schema";

interface FooterProps {
  content?: SiteContent;
  contactContent?: SiteContent;
}

export function Footer({ content, contactContent }: FooterProps) {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">KNX Smart Home</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {content?.bodyLt ||
                "Profesionalios namų automatizacijos sprendimai su KNX technologija. Sertifikuoti specialistai su ilgamete patirtimi."}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Kontaktai</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{contactContent?.bodyLt || "Vilnius, Lietuva"}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+37060000000" className="hover:text-foreground">
                  +370 600 00000
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:info@knxhome.lt"
                  className="hover:text-foreground"
                >
                  info@knxhome.lt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Nuorodos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#plans"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Planai
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Funkcijos
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Administravimas
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Apie KNX</h3>
            <p className="text-sm text-muted-foreground">
              KNX yra pasaulinis namų ir pastatų automatizacijos standartas,
              naudojamas daugiau nei 500 gamintojų ir sertifikuotas ISO/IEC.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} KNX Smart Home. Visos teisės saugomos.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              Privatumo politika
            </a>
            <a href="#" className="hover:text-foreground">
              Naudojimo sąlygos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
