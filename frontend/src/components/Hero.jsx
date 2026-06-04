import { motion } from 'framer-motion';
import { DeveloperIllustration, BackgroundParticles } from './SvgIllustrations';

export default function Hero({ data }) {
  const hero = data || {
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Passionate developer creating amazing web experiences.',
    avatar: '/hero.png',
    socialLinks: {
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
  };

  return (
    <section id="home" className="hero">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{hero.name}</h1>
        <p className="subtitle">{hero.title}</p>
        <p>{hero.bio}</p>
        <div className="social-links">
          <a href={hero.socialLinks.github} title="GitHub">⚡</a>
          <a href={hero.socialLinks.linkedin} title="LinkedIn">💼</a>
          <a href={hero.socialLinks.twitter} title="Twitter">🐦</a>
        </div>
      </motion.div>
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
      >
        <BackgroundParticles count={20} />
        <DeveloperIllustration />
      </motion.div>
    </section>
  );
}