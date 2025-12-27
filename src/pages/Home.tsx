import { Button } from '@/components/ui/button'
import { FileText, Code, Database, Copy, Check, Mail } from 'lucide-react'
import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'

const authors = [
	{ name: 'Qingyuan Liu', isCorresponding: false },
	{ name: 'Mo Zou', isCorresponding: false },
	{ name: 'Hengbin Zhang', isCorresponding: false },
	{ name: 'Dong Du', isCorresponding: true },
	{ name: 'Yubin Xia', isCorresponding: true },
	{ name: 'Haibo Chen', isCorresponding: false },
]

const affiliation = [
	'Institute of Parallel and Distributed Systems',
	'Shanghai Jiao Tong University'
]

const abstract = [
	`File systems are critical OS components that require constant evolution to support new hardware and emerging application needs. However, the traditional paradigm of developing features, fixing bugs, and maintaining the system incurs significant overhead, especially as systems grow in complexity. This paper proposes a new paradigm, generative file systems, which leverages Large Language Models (LLMs) to generate and evolve a file system from prompts, effectively addressing the need for robust evolution. Despite the widespread success of LLMs in code generation, attempts to create a functional file system have thus far been unsuccessful, mainly due to the ambiguity of natural language prompts.`,
	`This paper introduces SYSSPEC, a framework for developing generative file systems. Its key insight is to replace ambiguous natural language with principles adapted from formal methods. Instead of imprecise prompts, SYSSPEC employs a multi-part specification that accurately describes a file system's functionality, modularity, and concurrency. The specification acts as an unambiguous blueprint, guiding LLMs to generate expected code flexibly. To manage evolution, we develop a DAG-structured patch that operates on the specification itself, enabling new features to be added without violating existing invariants. Moreover, the SYSSPEC toolchain features a set of LLM-based agents with mechanisms to mitigate hallucination during construction and evolution. We demonstrate our approach by generating SPECFS, a concurrent file system. SPECFS passes hundreds of regression tests, matching a manually-coded baseline. We further confirm its evolvability by seamlessly integrating 10 real-world features from Ext4. Our work shows that a specification-guided approach makes generating and evolving complex systems not only feasible but also highly effective.`,
]

const bibtex = `@article{liu2025sharpenspeccutcode,
  title   = {Sharpen the Spec, Cut the Code: A Case for Generative File System with SYSSPEC},
  author  = {Qingyuan Liu and Mo Zou and Hengbin Zhang and Dong Du and Yubin Xia and Haibo Chen},
  year    = {2025},
  url     = {https://arxiv.org/abs/2512.13047}
}`

export default function Home() {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(bibtex)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="space-y-12">
			{/* Hero Section */}
			<section className="text-center space-y-12 pt-28">
				<h1 className="font-bold text-gray-900 leading-tight font-serif" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
                    <span className="block">
                        Sharpen the Spec, Cut the Code
                    </span>
                    <span className="block font-normal">
                        A Case for Generative File System with SYSSPEC
                    </span>
				</h1>
				<div className="space-y-5">
                    <p className="text-gray-800 text-xl font-serif">
						{authors.map((author, idx) => (
							<Fragment key={author.name}>
							<span className="inline-flex items-center">
                                {author.name}
                                {author.isCorresponding && (
                                <Mail className="w-3 h-3 ml-0.5 relative -top-1" />
                                )}
                            </span>
                            {idx < authors.length - 1 && <span>,  </span>}
                            </Fragment>
                        ))}
                    </p>
					<div className="text-base text-gray-600">
						{affiliation.map((line, idx) => (
							<p key={idx}>{line}</p>
						))}
					</div>
				</div>
			</section>

			{/* Links Section */}
			<section className="flex flex-wrap justify-center gap-4">
				<a href="https://arxiv.org/abs/2512.13047" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
					<Button variant="outline" className="gap-2 hover:bg-gray-100 hover:border-gray-400">
						<FileText className="w-4 h-4" />
						Paper
					</Button>
				</a>
				<a href="https://github.com/LLMNativeOS/specfs-ae/" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
					<Button variant="outline" className="gap-2 hover:bg-gray-100 hover:border-gray-400">
						<Code className="w-4 h-4" />
						Code
					</Button>
				</a>
				<Link to="/dataset" className="transition-transform hover:scale-105">
					<Button variant="outline" className="gap-2 hover:bg-gray-100 hover:border-gray-400">
						<Database className="w-4 h-4" />
						Dataset
					</Button>
				</Link>
				{/* <a href="#" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
					<Button variant="outline" className="gap-2 hover:bg-gray-100 hover:border-gray-400">
						<Presentation className="w-4 h-4" />
						Slides
					</Button>
				</a> */}
			</section>

			{/* Abstract Section */}
			<section className="space-y-8">
				<h2 className="text-2xl font-semibold text-gray-900">Abstract</h2>
				<div className="space-y-4">
					{abstract.map((paragraph, idx) => (
						<p key={idx} className="text-gray-700 leading-relaxed text-justify text-lg">
							{paragraph}
						</p>
					))}
				</div>
			</section>

			{/* Teaser Figure Section */}
			<section className="space-y-8">
				<h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
				<div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
					<img 
						src="./design-overview.jpg"
						alt="SYSSPEC Design Overview"
						className="w-full h-auto rounded-lg"
					/>
				</div>
				<p className="text-sm text-gray-500 text-center">
					Figure 1: SYSSPEC Design Overview
				</p>
			</section>

			{/* Citation Section */}
			<section className="space-y-8" style={{ paddingBottom: '4rem' }}>
				<h2 className="text-2xl font-semibold text-gray-900">Citation</h2>
				<div className="relative text-left">
					<pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto text-left">
						<code>{bibtex}</code>
					</pre>
					<Button
						variant="ghost"
						size="sm"
						className="absolute top-2 right-2 gap-1"
						onClick={handleCopy}
					>
						{copied ? (
							<>
								<Check className="w-4 h-4" />
								Copied
							</>
						) : (
							<>
								<Copy className="w-4 h-4" />
								Copy
							</>
						)}
					</Button>
				</div>
			</section>
		</div>
	)
}
