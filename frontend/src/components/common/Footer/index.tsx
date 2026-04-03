import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Instagram, Linkedin, Mail, ExternalLink, Tag } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './Footer.module.css'

import { APP_VERSION } from '@/constants/app'

export function Footer(): React.ReactElement {
  const { t, locale } = useLocale()

  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Support Callout - Centered and full width */}
        <div className={styles.donateSection}>
          <div className={styles.donateBox}>
            <div className={styles.donateContent}>
              <Heart size={24} className={styles.heartIcon} aria-hidden="true" />
              <div className={styles.donateText}>
                <p className={styles.donateTitle}>{t.common.footer.donate}</p>
                <p className={styles.donateDesc}>{t.common.footer.donateDesc}</p>
              </div>
            </div>
            <a
              href={import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/U.N.I.T.-kasmir'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateBtn}
            >
              <Heart size={14} aria-hidden="true" />
              {t.common.footer.donateButton}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Links Section - Single line */}
        <div className={styles.linksSection}>
          <div className={styles.brandCol}>
            <Link to={`/${locale}/`} className={styles.logo}>
              <BookOpen size={22} className={styles.logoIcon} aria-hidden="true" />
              <span className={styles.logoText}>U.N.I.T.</span>
            </Link>
            <p className={styles.logoTagline}>University Notes &amp; Issue Tracker</p>
          </div>

          <div className={styles.linksRow}>
            <div className={styles.linksCol}>
              <h3 className={styles.colTitle}>{t.common.footer.resources}</h3>
              <ul className={styles.linkList}>
                <li><Link to={`/${locale}/resources`} className={styles.link}>{t.common.footer.links.browse}</Link></li>
                <li><Link to={`/${locale}/request`} className={styles.link}>{t.common.footer.links.request}</Link></li>
                <li><Link to={`/${locale}/contribute`} className={styles.link}>{t.common.footer.links.contribute}</Link></li>
              </ul>
            </div>

            <div className={styles.linksCol}>
              <h3 className={styles.colTitle}>{t.common.footer.info}</h3>
              <ul className={styles.linkList}>
                <li><Link to={`/${locale}/about`} className={styles.link}>{t.common.footer.links.about}</Link></li>
                <li><Link to={`/${locale}/supporters`} className={styles.link}>{t.common.footer.links.supporters}</Link></li>
                <li><a href="mailto:hello@unit.in" className={styles.link}>{t.common.footer.links.contact}</a></li>
              </ul>
            </div>

            <div className={styles.linksCol}>
              <h3 className={styles.colTitle}>Study Hub</h3>
              <ul className={styles.linkList}>
                <li><Link to={`/${locale}/blogs`} className={styles.link}>Blogs</Link></li>
                <li><Link to={`/${locale}/study-plans`} className={styles.link}>Plans</Link></li>
                <li><Link to={`/${locale}/ai`} className={styles.link}>AI Guess</Link></li>
              </ul>
            </div>

            <div className={styles.linksCol}>
              <h3 className={styles.colTitle}>Connect</h3>
              <div className={styles.socialRow}>
                <a href="https://www.instagram.com/hachiwastudios/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram"><Instagram size={18} /></a>
                <a href="https://www.linkedin.com/in/hachi-wa-studios-52a4393a0/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a href="mailto:hello@unit.in" className={styles.socialLink} aria-label="Email"><Mail size={18} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.copyright}>
              {t.common.footer.copyright.replace('2026', String(currentYear))}
            </p>
            <div className={styles.legalLinks}>
              <Link to={`/${locale}/legal?tab=privacy`} className={styles.legalLink}>{t.common.footer.links.privacy}</Link>
              <Link to={`/${locale}/legal?tab=tos`} className={styles.legalLink}>{t.common.footer.links.tos}</Link>
            </div>
          </div>
          
          <div className={styles.bottomRight}>
            <Link to={`/${locale}/changelog`} className={styles.versionBadge}>
              <Tag size={11} aria-hidden="true" />
              {APP_VERSION}
            </Link>
            <p className={styles.credit}>{t.common.footer.built}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
