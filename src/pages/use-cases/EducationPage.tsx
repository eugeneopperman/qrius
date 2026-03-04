import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { BookOpen, Map, Library, Upload } from 'lucide-react';

const data: UseCasePageData = {
  breadcrumbLabel: 'Education',
  hero: {
    headline: 'QR codes that make learning a little easier.',
    subheadline: 'Classroom handouts, campus wayfinding, library resources, and assignment links — one scan instead of a long URL on a whiteboard.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fit=crop&q=80',
  },
  useCases: {
    headline: 'How educators use Qrius Codes.',
    layout: 'grid-2',
    items: [
      { icon: BookOpen, title: 'Classroom materials', description: 'Link worksheets, slides, or videos from a printed handout. Students scan instead of typing a 47-character Google Drive URL.' },
      { icon: Map, title: 'Campus wayfinding', description: 'QR codes on signs and maps link to directions, building info, or department pages. Especially helpful during orientation.' },
      { icon: Library, title: 'Library resources', description: 'Link physical book displays to digital catalogs, reading lists, or e-book downloads.' },
      { icon: Upload, title: 'Assignment submissions', description: 'A QR code on the assignment sheet links directly to the submission form. Fewer "where do I turn this in?" emails.' },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for education.',
    items: [
      { title: 'Free plan covers most classrooms.', description: '5 dynamic codes with unlimited scans is enough for most teachers — no budget approval needed. Need more? Starter is just $12/month.' },
      { title: 'Update without reprinting.', description: 'Semester changes, new resources, updated links — change the destination and reuse the same handouts.' },
      { title: 'Simple enough for anyone.', description: 'No training needed. If you can fill in a form and click download, you can make a QR code.' },
    ],
  },
  cta: {
    headline: 'Less time on tech. More time on teaching.',
  },
};

export default function EducationPage() {
  return <UseCasePageTemplate data={data} />;
}
