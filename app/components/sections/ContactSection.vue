<script setup lang="ts">
import { cvEntries } from '~/data/cv'
import { profile } from '~/data/profile'
import { socials } from '~/data/socials'

// One entry means a direct link. The menu for several languages arrives in T-39.
const [cv] = cvEntries
const mailto = `mailto:${profile.email}`
</script>

<template>
  <PageSection id="contact" heading-id="contact-h" title="Contact.">
    <p class="big">{{ profile.contactPrompt }}</p>
    <p>
      <TextLink :href="mailto" class="mail">{{ profile.email }}</TextLink>
    </p>
    <div class="actions">
      <!-- A plain mailto: link, so it works without JS. `data-action` lets T-36 open the dialog instead. -->
      <BaseButton :href="mailto" data-action="say-hi">Say hi</BaseButton>
    </div>
    <ul class="socials">
      <li>
        <!-- The PDF opens in a new tab and has no `download` attribute (Q2). -->
        <TextLink :href="cv.href" target="_blank" rel="noopener">
          CV <small>{{ cv.detail }}</small>
        </TextLink>
      </li>
      <li v-for="social in socials" :key="social.id">
        <TextLink :href="social.href">{{ social.label }}</TextLink>
      </li>
    </ul>
  </PageSection>
</template>

<style scoped>
.big {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-display-s);
  line-height: 1;
  letter-spacing: var(--tracking-h1);
  max-width: 12ch;
}

.mail {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xl);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs) var(--space-lg);
  list-style: none;
  padding: 0;
  margin: 0;
}

.socials small {
  margin-inline-start: var(--space-2xs);
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
