import path from "node:path"
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import type { ReactNode } from "react"
import { resume } from "@/data/resume"

const fontDirectory = path.join(process.cwd(), "assets/fonts")

Font.register({
  family: "Fixel",
  fonts: [
    {
      src: path.join(fontDirectory, "FixelText-Regular.woff"),
      fontWeight: 400,
    },
    {
      src: path.join(fontDirectory, "FixelText-SemiBold.woff"),
      fontWeight: 600,
    },
  ],
})
Font.register({
  family: "Fixel Display",
  src: path.join(fontDirectory, "FixelDisplay-Medium.woff"),
  fontWeight: 500,
})
Font.register({
  family: "JetBrains Mono",
  src: path.join(fontDirectory, "JetBrainsMono-Regular.woff"),
})
Font.registerHyphenationCallback((word) => [word])

const colors = {
  paper: "#f7fbf7",
  ink: "#051f20",
  green: "#235347",
  mint: "#daf1de",
  muted: "#48675b",
  border: "#b5d7bd",
  amber: "#e7b45a",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 32,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: "Fixel",
    fontSize: 10,
    lineHeight: 1.35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.green,
    paddingBottom: 10,
    marginBottom: 10,
  },
  name: {
    fontFamily: "Fixel Display",
    fontWeight: 500,
    fontSize: 28,
    lineHeight: 0.98,
    letterSpacing: -0.5,
  },
  role: { marginTop: 8, fontWeight: 600, fontSize: 11 },
  focus: { marginTop: 3, color: colors.muted, fontSize: 9 },
  contacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 4,
    marginBottom: 10,
  },
  link: { color: colors.green, textDecoration: "none", fontSize: 9 },
  summary: {
    marginBottom: 12,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 1.4,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  labelTitle: { fontWeight: 600, fontSize: 11 },
  rule: { flexGrow: 1, height: 0.6, backgroundColor: colors.border },
  job: { marginBottom: 10 },
  entryHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "baseline",
    marginBottom: 3,
  },
  company: { fontWeight: 600, fontSize: 12 },
  date: { fontFamily: "JetBrains Mono", fontSize: 8.5, color: colors.muted },
  jobRole: { color: colors.green, fontSize: 9, marginBottom: 5 },
  bullet: { flexDirection: "row", gap: 7, marginBottom: 3 },
  bulletMark: { color: colors.green, width: 5 },
  bulletText: { flex: 1 },
  project: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: colors.border,
  },
  projectLink: {
    color: colors.green,
    textDecoration: "none",
    fontSize: 9,
    marginBottom: 5,
  },
  stack: { marginTop: 5, color: colors.muted, fontSize: 9 },
  section: { marginBottom: 12 },
  skillRow: { flexDirection: "row", gap: 12, paddingBottom: 5 },
  skillLabel: {
    fontWeight: 600,
    color: colors.green,
    fontSize: 9,
  },
  skillValue: { flex: 1, fontSize: 9 },
})

function ResumeMark() {
  return (
    <View
      style={{ width: 72, height: 72, position: "relative", flexShrink: 0 }}
    >
      <View
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 49,
          height: 49,
          borderRadius: 25,
          borderWidth: 8.5,
          borderColor: colors.green,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 35,
          top: 35,
          width: 26,
          height: 26,
          borderWidth: 3.5,
          borderColor: colors.green,
          backgroundColor: colors.mint,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 51,
          top: 9,
          width: 9,
          height: 9,
          backgroundColor: colors.amber,
        }}
      />
    </View>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <View style={styles.label}>
      <Text style={styles.labelTitle}>{children}</Text>
      <View style={styles.rule} />
    </View>
  )
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  )
}

function Footer({ page }: { page: number }) {
  return (
    <View
      style={{
        marginTop: 8,
        paddingTop: 6,
        borderTopWidth: 0.6,
        borderTopColor: colors.border,
        flexDirection: "row",
        justifyContent: "flex-end",
        fontFamily: "JetBrains Mono",
        fontSize: 8,
        color: colors.muted,
      }}
    >
      <Text>{page} / 2</Text>
    </View>
  )
}

export function ResumeDocument() {
  return (
    <Document
      title={`${resume.name} / Résumé`}
      author={resume.name}
      subject={resume.role}
      language="en"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{resume.name}</Text>
            <Text style={styles.role}>{resume.role}</Text>
            <Text style={styles.focus}>{resume.focus}</Text>
          </View>
          <ResumeMark />
        </View>
        <View style={styles.contacts}>
          <Link src={`mailto:${resume.email}`} style={styles.link}>
            {resume.email}
          </Link>
          <Link src={resume.phoneLink} style={styles.link}>
            {resume.phone}
          </Link>
          <Text style={styles.link}>{resume.location}</Text>
          <Link src={resume.github} style={styles.link}>
            github.com/bukitoka
          </Link>
          <Link src={resume.linkedin} style={styles.link}>
            linkedin.com/in/kusumajy
          </Link>
        </View>
        <SectionLabel>Summary</SectionLabel>
        <Text style={styles.summary}>{resume.summary}</Text>
        <SectionLabel>Work Experience</SectionLabel>
        {resume.experience.map((job) => (
          <View key={job.company} style={styles.job} wrap={false}>
            <View style={styles.entryHeading}>
              <Text style={styles.company}>{job.company}</Text>
              <Text style={styles.date}>{job.date}</Text>
            </View>
            <Text style={styles.jobRole}>{job.role}</Text>
            {job.highlights.map((highlight) => (
              <Bullet key={highlight}>{highlight}</Bullet>
            ))}
          </View>
        ))}
        <Footer page={1} />
      </Page>
      <Page size="A4" style={styles.page}>
        <SectionLabel>Projects</SectionLabel>
        {resume.projects.map((project) => (
          <View key={project.name} style={styles.project} wrap={false}>
            <View style={styles.entryHeading}>
              <Text style={styles.company}>{project.name}</Text>
              <Text style={styles.date}>{project.year}</Text>
            </View>
            <Link src={project.href} style={styles.projectLink}>
              {project.href.replace(/^https?:\/\//, "")}
            </Link>
            {project.notes.map((note) => (
              <Bullet key={note}>{note}</Bullet>
            ))}
            <Text style={styles.stack}>{project.stack.join(" · ")}</Text>
          </View>
        ))}
        <View style={styles.section}>
          <SectionLabel>Skills</SectionLabel>
          {resume.skills.map((skill) => (
            <View key={skill.label} style={styles.skillRow} wrap={false}>
              <Text style={styles.skillValue}>
                <Text style={styles.skillLabel}>{skill.label}: </Text>
                {skill.value}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.section} wrap={false}>
          <SectionLabel>Education</SectionLabel>
          <View style={styles.entryHeading}>
            <Text style={styles.company}>{resume.education.school}</Text>
            <Text style={styles.date}>{resume.education.period}</Text>
          </View>
          <Text>
            {resume.education.degree} · {resume.education.result}
          </Text>
        </View>
        <View wrap={false}>
          <SectionLabel>Certifications</SectionLabel>
          <Text>{resume.certification}</Text>
        </View>
        <View style={{ marginTop: 16 }} wrap={false}>
          <SectionLabel>Languages</SectionLabel>
          <Text>{resume.languages}</Text>
        </View>
        <Footer page={2} />
      </Page>
    </Document>
  )
}
