import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Instagram, Linkedin, Mail, ExternalLink, Globe, Tag } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './Footer.module.scss'

const APP_VERSION = 'v0.0.7 Beta'

export function Footer(): React.ReactElement {
  const { t, locale } = useLocale()

  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Top section */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to={`/${locale}/`} className={styles.logo}>
              <BookOpen size={22} className={styles.logoIcon} aria-hidden="true" />
              <span className={styles.logoText}>NotesHub Kashmir</span>
            </Link>
            <p className={styles.tagline}>{t.common.footer.tagline}</p>

            {/* Donate CTA */}
            <div className={styles.donateBox}>
              <Heart size={16} className={styles.heartIcon} aria-hidden="true" />
              <div>
                <p className={styles.donateTitle}>{t.common.footer.donate}</p>
                <p className={styles.donateDesc}>{t.common.footer.donateDesc}</p>
              </div>
              <a
                href={import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/noteshub-kasmir'}
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

          {/* Links column 1: Resources */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>{t.common.footer.resources}</h3>
            <ul className={styles.linkList}>
              <li>
                <Link to={`/${locale}/resources`} className={styles.link}>
                  {t.common.footer.links.browse}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/request`} className={styles.link}>
                  {t.common.footer.links.request}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/contribute`} className={styles.link}>
                  {t.common.footer.links.contribute}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links column 2: Information */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>{t.common.footer.info}</h3>
            <ul className={styles.linkList}>
              <li>
                <Link to={`/${locale}/about`} className={styles.link}>
                  {t.common.footer.links.about}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/legal?tab=privacy`} className={styles.link}>
                  {t.common.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/legal?tab=tos`} className={styles.link}>
                  {t.common.footer.links.tos}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/supporters`} className={styles.link}>
                  {t.common.footer.links.supporters}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@noteshubkashmir.in"
                  className={styles.link}
                >
                  {t.common.footer.links.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Links column 3: Study Hub */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Study Hub</h3>
            <ul className={styles.linkList}>
              <li>
                <Link to={`/${locale}/blogs`} className={styles.link}>
                  Study Blogs
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/study-plans`} className={styles.link}>
                  Study Plans
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/ai`} className={styles.link}>
                  AI Guess Papers
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/changelog`} className={styles.link}>
                  <Tag size={14} aria-hidden="true" />
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Links column 4: Social */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Connect</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="https://www.instagram.com/hachiwastudios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <Instagram size={14} aria-hidden="true" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/hachi-wa-studios-52a4393a0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <Linkedin size={14} aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://desk-of-saar.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <Globe size={14} aria-hidden="true" />
                  Omar's Portfolio
                </a>
              </li>
              <li>
                <a href="mailto:hello@noteshubkashmir.in" className={styles.link}>
                  <Mail size={14} aria-hidden="true" />
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {t.common.footer.copyright.replace('2026', String(currentYear))}
          </p>
          <Link to={`/${locale}/changelog`} className={styles.versionBadge} aria-label="View changelog">
            <Tag size={11} aria-hidden="true" />
            {APP_VERSION}
          </Link>
          <p className={styles.credit}>
            {t.common.footer.built}
          </p>
        </div>
      </div>
    </footer>
  )
}
