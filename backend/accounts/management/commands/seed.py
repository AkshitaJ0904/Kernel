from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date


class Command(BaseCommand):
    help = 'seed database with sample data'

    def handle(self, *args, **options):
        self._seed_patterns()
        self._seed_problems()
        self._seed_tracks()
        self._seed_programs()
        self._seed_orgs()
        self._seed_contest_content()
        self._seed_contests()
        self._seed_demo_user()
        self.stdout.write(self.style.SUCCESS('seeded successfully'))

    def _seed_patterns(self):
        from arena.models import Pattern
        patterns = [
            ('two-pointer', 'two-pointer'), ('sliding-window', 'sliding window'),
            ('binary-search', 'binary search'), ('dfs', 'dfs / bfs'),
            ('topo-sort', 'topological sort'), ('union-find', 'union find'),
            ('heap', 'heap / priority queue'), ('trie', 'trie'),
            ('dp-1d', 'dp · 1d'), ('dp-2d', 'dp · 2d'),
            ('monotonic-stack', 'monotonic stack'), ('backtracking', 'backtracking'),
            ('greedy', 'greedy'), ('bit-manipulation', 'bit manipulation'),
            ('linked-list', 'linked list'), ('trees', 'trees'),
            ('graphs', 'graphs'), ('intervals', 'intervals'),
            ('arrays', 'arrays'), ('strings', 'strings'),
            ('math', 'math'), ('design', 'design'),
            ('divide-conquer', 'divide & conquer'), ('segment-tree', 'segment tree'),
        ]
        for i, (slug, name) in enumerate(patterns):
            Pattern.objects.get_or_create(name=slug, defaults={'display_name': name, 'order': i})
        self.stdout.write('  patterns: done')

    def _seed_problems(self):
        from arena.models import Pattern, Problem
        problems_data = [
            ('Two Sum', 'two-sum', 'arrays', 'easy', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', '1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.'),
            ('3Sum', '3sum', 'two-pointer', 'medium', 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.', '3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5'),
            ('Container With Most Water', 'container-with-most-water', 'two-pointer', 'medium', 'You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.', 'n >= 2\n0 <= height[i] <= 10^4'),
            ('Longest Substring Without Repeating Characters', 'longest-substring-no-repeat', 'sliding-window', 'medium', 'Given a string s, find the length of the longest substring without repeating characters.', '0 <= s.length <= 5 * 10^4'),
            ('Minimum Window Substring', 'min-window-substring', 'sliding-window', 'hard', 'Given two strings s and t, return the minimum window substring of s such that every character in t is included in the window.', '1 <= m, n <= 10^5'),
            ('Binary Search', 'binary-search', 'binary-search', 'easy', 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.', '-10^4 <= nums[i], target <= 10^4'),
            ('Search in Rotated Sorted Array', 'search-rotated-sorted', 'binary-search', 'medium', 'Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.', '1 <= nums.length <= 5000'),
            ('Number of Islands', 'number-of-islands', 'dfs', 'medium', 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.', '1 <= m, n <= 300'),
            ('Clone Graph', 'clone-graph', 'dfs', 'medium', 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.', 'The number of nodes in the graph is in the range [0, 100].'),
            ('Course Schedule', 'course-schedule', 'topo-sort', 'medium', 'There are a total of numCourses courses you have to take. Some courses have prerequisites. Determine if you can finish all courses.', '1 <= numCourses <= 2000'),
            ('Course Schedule II', 'course-schedule-ii', 'topo-sort', 'medium', 'Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them.', '1 <= numCourses <= 2000'),
            ('Kth Largest Element', 'kth-largest-element', 'heap', 'medium', 'Given an integer array nums and an integer k, return the kth largest element in the array.', '1 <= k <= nums.length <= 10^5'),
            ('Top K Frequent Elements', 'top-k-frequent', 'heap', 'medium', 'Given an integer array nums and an integer k, return the k most frequent elements.', '1 <= nums.length <= 10^5'),
            ('Implement Trie', 'implement-trie', 'trie', 'medium', 'A trie (pronounced as "try") or prefix tree is a tree data structure. Implement the Trie class.', '1 <= word.length, prefix.length <= 2000'),
            ('Climbing Stairs', 'climbing-stairs', 'dp-1d', 'easy', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. Return the number of distinct ways to climb to the top.', '1 <= n <= 45'),
            ('House Robber', 'house-robber', 'dp-1d', 'medium', 'Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.', '1 <= nums.length <= 100'),
            ('Coin Change', 'coin-change', 'dp-1d', 'medium', 'Given an integer array coins representing coins of different denominations and an integer amount, return the fewest number of coins needed to make up that amount.', '1 <= coins.length <= 12'),
            ('Longest Common Subsequence', 'longest-common-subsequence', 'dp-2d', 'medium', 'Given two strings text1 and text2, return the length of their longest common subsequence.', '1 <= text1.length, text2.length <= 1000'),
            ('Edit Distance', 'edit-distance', 'dp-2d', 'hard', 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.', '0 <= word1.length, word2.length <= 500'),
            ('Daily Temperatures', 'daily-temperatures', 'monotonic-stack', 'medium', 'Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.', '1 <= temperatures.length <= 10^5'),
            ('Subsets', 'subsets', 'backtracking', 'medium', 'Given an integer array nums of unique elements, return all possible subsets (the power set).', '1 <= nums.length <= 10'),
            ('Permutations', 'permutations', 'backtracking', 'medium', 'Given an array nums of distinct integers, return all the possible permutations.', '1 <= nums.length <= 6'),
            ('N-Queens', 'n-queens', 'backtracking', 'hard', 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.', '1 <= n <= 9'),
            ('Maximum Depth of Binary Tree', 'max-depth-binary-tree', 'trees', 'easy', 'Given the root of a binary tree, return its maximum depth.', 'The number of nodes in the tree is in the range [0, 10^4].'),
            ('Invert Binary Tree', 'invert-binary-tree', 'trees', 'easy', 'Given the root of a binary tree, invert the tree, and return its root.', 'The number of nodes in the tree is in the range [0, 100].'),
            ('Serialize and Deserialize Binary Tree', 'serialize-deserialize-bt', 'trees', 'hard', 'Design an algorithm to serialize and deserialize a binary tree.', 'The number of nodes in the tree is in the range [0, 10^4].'),
            ('Word Ladder', 'word-ladder', 'graphs', 'hard', 'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence.', '1 <= beginWord.length <= 10'),
            ('Merge Intervals', 'merge-intervals', 'intervals', 'medium', 'Given an array of intervals, merge all overlapping intervals.', '1 <= intervals.length <= 10^4'),
            ('Best Time to Buy and Sell Stock', 'best-time-buy-sell', 'arrays', 'easy', 'Given an array prices where prices[i] is the price of a given stock on the ith day, return the maximum profit you can achieve.', '1 <= prices.length <= 10^5'),
            ('Product of Array Except Self', 'product-array-except-self', 'arrays', 'medium', 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].', '2 <= nums.length <= 10^5'),
            ('Valid Parentheses', 'valid-parentheses', 'strings', 'easy', "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", '1 <= s.length <= 10^4'),
            ('Longest Palindromic Substring', 'longest-palindromic-substring', 'strings', 'medium', 'Given a string s, return the longest palindromic substring in s.', '1 <= s.length <= 1000'),
            ('Group Anagrams', 'group-anagrams', 'strings', 'medium', 'Given an array of strings strs, group the anagrams together.', '1 <= strs.length <= 10^4'),
            ('Reverse Linked List', 'reverse-linked-list', 'linked-list', 'easy', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'The number of nodes in the list is the range [0, 5000].'),
            ('Merge K Sorted Lists', 'merge-k-sorted-lists', 'linked-list', 'hard', 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.', 'k == lists.length\n0 <= k <= 10^4'),
            ('LRU Cache', 'lru-cache', 'design', 'medium', 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', '1 <= capacity <= 3000'),
            ('Median of Two Sorted Arrays', 'median-two-sorted-arrays', 'divide-conquer', 'hard', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.', 'm == nums1.length\nn == nums2.length'),
            ('Power(x, n)', 'powxn', 'divide-conquer', 'medium', 'Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).', '-100.0 < x < 100.0\n-2^31 <= n <= 2^31-1'),
            ('Single Number', 'single-number', 'bit-manipulation', 'easy', 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.', '1 <= nums.length <= 3 * 10^4'),
            ('Number of 1 Bits', 'number-1-bits', 'bit-manipulation', 'easy', 'Write a function that takes the binary representation of an unsigned integer and returns the number of 1 bits it has.', 'The input must be a binary string of length 32.'),
            ('Jump Game', 'jump-game', 'greedy', 'medium', 'Given an integer array nums, return true if you can reach the last index starting from the first index.', '1 <= nums.length <= 3 * 10^4'),
            ('Gas Station', 'gas-station', 'greedy', 'medium', 'There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. Return the starting gas station index.', 'n == gas.length == cost.length\n1 <= n <= 10^5'),
            ('Find the Duplicate Number', 'find-duplicate', 'two-pointer', 'medium', 'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive, find the duplicate number.', '1 <= n <= 10^5'),
            ('Trapping Rain Water', 'trapping-rain-water', 'two-pointer', 'hard', 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.', 'n == height.length\n1 <= n <= 2 * 10^4'),
            ('Spiral Matrix', 'spiral-matrix', 'arrays', 'medium', 'Given an m x n matrix, return all elements of the matrix in spiral order.', 'm == matrix.length\n1 <= m, n <= 10'),
            ('Rotate Image', 'rotate-image', 'arrays', 'medium', 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).', 'n == matrix.length == matrix[i].length\n1 <= n <= 20'),
            ('Word Search', 'word-search', 'backtracking', 'medium', 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.', 'm == board.length\n1 <= m, n <= 6'),
            ('Combination Sum', 'combination-sum', 'backtracking', 'medium', 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.', '1 <= candidates.length <= 30'),
            ('Validate Binary Search Tree', 'validate-bst', 'trees', 'medium', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).', 'The number of nodes in the tree is in the range [1, 10^4].'),
            ('Lowest Common Ancestor', 'lowest-common-ancestor', 'trees', 'medium', 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.', 'The number of nodes in the tree is in the range [2, 10^5].'),
        ]
        for title, slug, pattern_slug, difficulty, description, constraints in problems_data:
            try:
                pattern = Pattern.objects.get(name=pattern_slug)
            except Pattern.DoesNotExist:
                pattern = None
            Problem.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': title, 'pattern': pattern,
                    'difficulty': difficulty, 'description': description,
                    'constraints': constraints, 'is_active': True,
                }
            )
        self.stdout.write('  problems: done')

    def _seed_tracks(self):
        from workshop.models import Track, Module
        tracks = [
            ('rust', 'rust', 'Rust', 'systems programming with ownership and lifetimes'),
            ('go', 'go', 'Go', 'concurrent systems and cloud-native services'),
            ('cpp', 'c++', 'C++', 'performance-critical systems and competitive programming'),
            ('python', 'python', 'Python', 'scripting, data, and backend apis'),
            ('typescript', 'typescript', 'TypeScript', 'frontend, node, and typed javascript'),
        ]
        modules_per_track = {
            'rust': [
                ('hello, ownership', 'hello-ownership', 0),
                ('borrowing and references', 'borrowing-references', 1),
                ('structs and enums', 'structs-enums', 2),
                ('lifetimes', '04-lifetimes', 3),
                ('traits and generics', 'traits-generics', 4),
                ('error handling', 'error-handling', 5),
                ('closures and iterators', 'closures-iterators', 6),
                ('concurrency', 'concurrency', 7),
            ],
            'go': [
                ('hello, go', 'hello-go', 0),
                ('goroutines and channels', 'goroutines-channels', 1),
                ('interfaces', 'interfaces', 2),
                ('error patterns', 'error-patterns', 3),
                ('http servers', 'http-servers', 4),
            ],
        }
        for slug, language, display_name, description in tracks:
            track, _ = Track.objects.get_or_create(
                name=slug,
                defaults={'display_name': display_name, 'language': language, 'description': description}
            )
            for mod_title, mod_slug, mod_order in modules_per_track.get(slug, []):
                Module.objects.get_or_create(
                    track=track, slug=mod_slug,
                    defaults={'title': mod_title, 'order': mod_order, 'estimated_minutes': 45}
                )
        self.stdout.write('  tracks: done')

    def _seed_programs(self):
        from warroom.models import Program
        now = timezone.now()
        programs = [
            {
                'name': 'gsoc', 'display_name': 'google summer of code',
                'stipend_min_usd': 3000, 'stipend_max_usd': 6600, 'currency': 'USD',
                'description': '12-week paid open-source mentorship with ~200 orgs. the flagship.',
                'website_url': 'https://summerofcode.withgoogle.com',
                'deadline_opens_at': now + timedelta(days=14),
                'deadline_closes_at': now + timedelta(days=45),
                'slots_count': 1572, 'acceptance_rate': 23.0, 'color': 'accent', 'order': 0,
            },
            {
                'name': 'c4gt', 'display_name': 'code for govtech',
                'stipend_inr': 70000, 'currency': 'INR',
                'description': 'india-only. build for dpi: aadhaar, ondc, diksha, beckn.',
                'website_url': 'https://codeforgovtech.in',
                'deadline_closes_at': now + timedelta(days=6),
                'slots_count': 120, 'acceptance_rate': 31.0, 'color': 'warn', 'order': 1,
            },
            {
                'name': 'lfx', 'display_name': 'lfx mentorship',
                'stipend_min_usd': 3000, 'stipend_max_usd': 3000, 'currency': 'USD',
                'description': 'linux foundation projects. kubernetes, envoy, opentelemetry.',
                'website_url': 'https://mentorship.lfx.linuxfoundation.org',
                'slots_count': 280, 'acceptance_rate': 12.0, 'color': 'accent', 'order': 2,
            },
            {
                'name': 'sob', 'display_name': 'summer of bitcoin',
                'stipend_min_usd': 3000, 'stipend_max_usd': 3000, 'currency': 'USD',
                'description': 'bitcoin core, lightning, layer-2. heavy systems, light dependencies.',
                'website_url': 'https://www.summerofbitcoin.org',
                'deadline_opens_at': now + timedelta(days=31),
                'slots_count': 40, 'acceptance_rate': 12.0, 'color': 'accent', 'order': 3,
            },
            {
                'name': 'esoc', 'display_name': 'esoc — ethereum',
                'stipend_min_usd': 3000, 'stipend_max_usd': 5000, 'currency': 'USD',
                'description': 'ethereum ecosystem — clients, l2s, devtools, research.',
                'website_url': 'https://esp.ethereum.foundation',
                'deadline_closes_at': now + timedelta(days=9),
                'slots_count': 60, 'acceptance_rate': 19.0, 'color': 'warn', 'order': 4,
            },
            {
                'name': 'outreachy', 'display_name': 'outreachy',
                'stipend_min_usd': 7000, 'stipend_max_usd': 7000, 'currency': 'USD',
                'description': 'for underrepresented contributors. 13-week internships.',
                'website_url': 'https://www.outreachy.org',
                'slots_count': 80, 'acceptance_rate': None, 'color': 'muted', 'order': 5,
            },
        ]
        for data in programs:
            Program.objects.get_or_create(name=data['name'], defaults=data)
        self.stdout.write('  programs: done')

    def _seed_orgs(self):
        from warroom.models import Org, Program, ProgramOrg
        orgs = [
            ('apache-nuttx', 'apache nuttx', ['c', 'rtos', 'embedded']),
            ('cncf-prometheus', 'cncf prometheus', ['go', 'monitoring', 'metrics']),
            ('postgresql', 'postgresql', ['c', 'databases', 'sql']),
            ('kubernetes', 'kubernetes', ['go', 'cloud-native', 'containers']),
            ('beckn', 'beckn', ['typescript', 'dpi', 'india']),
            ('ondc', 'ondc', ['python', 'dpi', 'india']),
            ('envoy-proxy', 'envoy proxy', ['c++', 'networking', 'proxy']),
            ('opentelemetry', 'opentelemetry', ['go', 'observability', 'tracing']),
        ]
        gsoc = Program.objects.filter(name='gsoc').first()
        c4gt = Program.objects.filter(name='c4gt').first()
        lfx = Program.objects.filter(name='lfx').first()
        for slug, name, tags in orgs:
            org, _ = Org.objects.get_or_create(slug=slug, defaults={'name': name, 'stack_tags': tags})
            if gsoc and slug in ('apache-nuttx', 'cncf-prometheus', 'postgresql', 'kubernetes'):
                ProgramOrg.objects.get_or_create(program=gsoc, org=org, year=2026)
            if c4gt and slug in ('beckn', 'ondc'):
                ProgramOrg.objects.get_or_create(program=c4gt, org=org, year=2026)
            if lfx and slug in ('kubernetes', 'envoy-proxy', 'opentelemetry'):
                ProgramOrg.objects.get_or_create(program=lfx, org=org, year=2026)
        self.stdout.write('  orgs: done')

    def _seed_contest_content(self):
        """Example detail-page content for GSoC — proves the reusable
        structure end to end. New contests need no code, just admin rows."""
        from datetime import date
        from warroom.models import (
            Program, ContestOverview, OverviewLink, ContestFlowStep,
            ContestTimeline, TimelineEvent, StipendTier, StipendPhase,
            ContestFAQ, VideoTopic, Video, VideoChapter,
        )
        gsoc = Program.objects.filter(name='gsoc').first()
        if not gsoc:
            self.stdout.write('  contest content: skipped (no gsoc program)')
            return

        ContestOverview.objects.update_or_create(
            program=gsoc,
            defaults={
                'description_long': (
                    'Google Summer of Code is a global, online program focused on bringing '
                    'new contributors into open-source software development. Contributors work '
                    'with an open-source organization on a 12+ week programming project under '
                    'the guidance of mentors.'
                ),
                'objective': 'Get students and beginners contributing to real open-source projects with mentorship and a stipend.',
                'eligibility': '- 18 years or older\n- New or beginner contributor to open source\n- Eligible to work in your country of residence',
                'registration_process': (
                    '1. Register on the GSoC site once applications open.\n'
                    '2. Pick organizations and discuss project ideas with mentors.\n'
                    '3. Write and submit a proposal before the deadline.'
                ),
                'prerequisites': '- Comfort with git and one programming language\n- Ability to read an existing codebase\n- ~30 hrs/week during the coding period',
            },
        )
        links = [
            ('official website', 'https://summerofcode.withgoogle.com', 0),
            ('program rules', 'https://summerofcode.withgoogle.com/rules', 1),
            ('contributor guide', 'https://google.github.io/gsocguides/student/', 2),
        ]
        for label, url, order in links:
            OverviewLink.objects.get_or_create(program=gsoc, label=label, defaults={'url': url, 'order': order})

        flow = [
            ('organization list releases', 'Google announces the list of accepted mentoring organizations.'),
            ('students explore organizations', 'Read project ideas, reach out to mentors, and pick a fit.'),
            ('community bonding', 'Get to know the org, set up your dev environment, finalize scope.'),
            ('proposal submission', 'Write a focused proposal and submit before the deadline.'),
            ('selection announcement', 'Accepted contributors are announced.'),
            ('coding period', '12+ weeks of building, with regular mentor check-ins.'),
            ('final evaluation', 'Final submission and mentor evaluation decide pass/fail.'),
        ]
        for i, (title, desc) in enumerate(flow):
            ContestFlowStep.objects.get_or_create(program=gsoc, title=title, defaults={'description': desc, 'order': i})

        tl, _ = ContestTimeline.objects.get_or_create(
            program=gsoc, name='2026 timeline', defaults={'year': 2026, 'is_current': True, 'order': 0}
        )
        events = [
            ('organization announcements', date(2026, 2, 27), date(2026, 2, 27), 'Accepted orgs published.'),
            ('proposal submission', date(2026, 3, 24), date(2026, 4, 8), 'Application window for contributors.'),
            ('results announced', date(2026, 5, 8), date(2026, 5, 8), 'Accepted contributors revealed.'),
            ('community bonding', date(2026, 5, 8), date(2026, 6, 1), 'Onboard with your org.'),
            ('coding phase', date(2026, 6, 1), date(2026, 8, 25), 'Main development period.'),
        ]
        for i, (title, sd, ed, desc) in enumerate(events):
            TimelineEvent.objects.get_or_create(
                timeline=tl, title=title,
                defaults={'start_date': sd, 'end_date': ed, 'description': desc, 'order': i},
            )

        StipendTier.objects.get_or_create(
            program=gsoc, region='medium project (175h)',
            defaults={'amount': 3000, 'currency': 'USD', 'note': 'tier varies by purchasing power parity', 'order': 0},
        )
        StipendTier.objects.get_or_create(
            program=gsoc, region='large project (350h)',
            defaults={'amount': 6600, 'currency': 'USD', 'note': 'tier varies by purchasing power parity', 'order': 1},
        )
        StipendPhase.objects.get_or_create(
            program=gsoc, name='phase 1 — midterm',
            defaults={'timing': 'after midterm evaluation', 'note': '~50% of the stipend', 'order': 0},
        )
        StipendPhase.objects.get_or_create(
            program=gsoc, name='phase 2 — final',
            defaults={'timing': 'after final evaluation', 'note': 'remaining stipend on passing', 'order': 1},
        )

        faqs = [
            ('Do I need prior open-source experience?', 'No — GSoC is designed for new contributors. A clear proposal and willingness to learn matter most.'),
            ('Can I apply to multiple organizations?', 'You can submit up to a limited number of proposals (historically 2), but quality over quantity wins.'),
            ('Is GSoC remote?', 'Yes, it is fully online. You work with mentors remotely.'),
        ]
        for i, (q, a) in enumerate(faqs):
            ContestFAQ.objects.get_or_create(program=gsoc, question=q, defaults={'answer': a, 'order': i})

        topic, _ = VideoTopic.objects.get_or_create(
            program=gsoc, slug='getting-started', defaults={'name': 'getting started', 'order': 0}
        )
        videos = [
            # placeholder public videos — swap for real ones in the admin
            ('what is gsoc?', 'gsoc-intro', 'A quick intro to the program and who it is for.', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'),
            ('picking an organization', 'picking-an-org', 'How to evaluate orgs and project ideas.', 'https://youtu.be/dQw4w9WgXcQ'),
            ('writing a winning proposal', 'winning-proposal', 'Structure, scope, and timeline tips.', 'https://www.youtube.com/watch?v=9bZkp7q19f0'),
        ]
        chapters_by_slug = {
            'gsoc-intro': [(0, 'what is gsoc'), (30, 'who can apply'), (75, 'timeline overview'), (120, 'wrap-up')],
            'picking-an-org': [(0, 'intro'), (45, 'evaluating activity'), (90, 'reaching out to mentors')],
            'winning-proposal': [(0, 'intro'), (40, 'structure'), (95, 'scoping the work'), (160, 'timeline & deliverables')],
        }
        for i, (title, slug, desc, url) in enumerate(videos):
            video, _ = Video.objects.update_or_create(
                topic=topic, slug=slug,
                defaults={'title': title, 'description': desc, 'order': i, 'video_url': url},
            )
            for j, (ts, ch_title) in enumerate(chapters_by_slug.get(slug, [])):
                VideoChapter.objects.update_or_create(
                    video=video, timestamp_seconds=ts,
                    defaults={'title': ch_title, 'order': j},
                )
        self.stdout.write('  contest content: done')

    def _seed_contests(self):
        from arena.models import Contest
        now = timezone.now()
        contests = [
            ('weekly #422', 'weekly-422', 'leetcode', now + timedelta(days=3, hours=22), 90, 4),
            ('codeforces div2', 'codeforces-div2', 'codeforces', now + timedelta(days=4, hours=10), 120, 6),
            ('arena cup · march', 'arena-cup-march', 'internal', now + timedelta(days=8), 180, 8),
        ]
        for name, slug, platform, starts_at, duration, problems in contests:
            Contest.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name, 'platform': platform,
                    'starts_at': starts_at,
                    'ends_at': starts_at + timedelta(minutes=duration),
                    'duration_minutes': duration,
                    'problem_count': problems,
                    'is_active': True,
                }
            )
        self.stdout.write('  contests: done')

    def _seed_demo_user(self):
        from django.contrib.auth import get_user_model
        from accounts.models import UserProfile
        from arena.models import Problem, Submission
        from activity.models import ActivityEntry, Notification
        from warroom.models import Program, Org, UserProgramTracking, ProgramOrg

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email='aarav@kernel.dev',
            defaults={
                'username': 'aarav.k',
                'college': 'iit bombay',
                'graduation_year': 2027,
                'github_username': 'aaravk',
                'bio': 'gsoc \'25 · apache nuttx. building in the open.',
                'is_active': True,
            }
        )
        if created:
            user.set_password('kernel123')
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.streak_current = 12
        profile.streak_longest = 31
        profile.streak_last_active = timezone.now().date()
        profile.total_solved = 342
        profile.total_prs_merged = 3
        profile.total_proposals_submitted = 1
        profile.save()

        now = timezone.now()
        activity_data = [
            ('solved', 'solved · arrays/two-pointer/3sum', {'problem': '3sum', 'time': 1080, 'attempt': 3}),
            ('started_module', 'started · workshop/rust/04-lifetimes', {}),
            ('opened_pr', 'opened pr · apache/airflow#41281', {'pr': 41281, 'org': 'apache/airflow'}),
            ('draft_proposal', 'draft · gsoc proposal · apache nuttx', {'version': 1, 'org': 'apache nuttx'}),
            ('streak_milestone', 'streak +1 · 12 days', {'streak': 12}),
            ('solved', 'solved · graphs/topo/course-schedule', {'problem': 'course-schedule-ii', 'attempt': 3}),
            ('contest_entry', 'contest · weekly #420 · rank 184/12k', {'rank': 184, 'total': 12000}),
        ]
        hashes = ['a3f1c2e', 'b8e2440', '9d12fa1', 'e0b7c3a', 'c45a190', 'f117b0b', '42aabbc']
        for i, (atype, title, meta) in enumerate(activity_data):
            delta = timedelta(minutes=12 * (i + 1)) if i == 0 else timedelta(hours=2 * i)
            ActivityEntry.objects.get_or_create(
                user=user, git_hash=hashes[i],
                defaults={'type': atype, 'title': title, 'metadata': meta,
                          'created_at': now - (timedelta(minutes=12) if i == 0 else timedelta(hours=2*i))}
            )

        # mark some problems as solved
        solved_slugs = ['two-sum', 'max-depth-binary-tree', 'climbing-stairs', 'reverse-linked-list',
                        'invert-binary-tree', 'binary-search', 'single-number', 'valid-parentheses',
                        'best-time-buy-sell', 'number-1-bits']
        for slug in solved_slugs:
            try:
                problem = Problem.objects.get(slug=slug)
                Submission.objects.get_or_create(
                    user=user, problem=problem, attempt_number=1,
                    defaults={'status': 'solved', 'time_taken_seconds': 600}
                )
            except Problem.DoesNotExist:
                pass

        # notifications
        notif_data = [
            ('unread', 'apache/nuttx · pr #14721 merged', 'apache/nuttx · your pr #14721 was merged. nice.'),
            ('warn', 'gsoc 2026 · deadline approaching', 'gsoc 2026 · applications open in 14d. you have 1 draft.'),
            ('unread', 'mentor: ria s. · proposal review', 'mentor: ria s. · reviewed your proposal v1 — 4 comments.'),
            ('info', 'contest · weekly #421 results', 'contest · weekly #421 · rank 184 / 12,403 · solved 3/4'),
            ('info', 'roadmap · rust/04 progress', 'roadmap · rust/04 — lifetimes is 62% complete. pick it back up.'),
        ]
        for i, (ntype, title, body) in enumerate(notif_data):
            Notification.objects.get_or_create(
                user=user, title=title,
                defaults={'type': ntype, 'body': body, 'read': i > 2}
            )

        # track programs
        gsoc = Program.objects.filter(name='gsoc').first()
        c4gt = Program.objects.filter(name='c4gt').first()
        lfx = Program.objects.filter(name='lfx').first()
        for prog in filter(None, [gsoc, c4gt, lfx]):
            UserProgramTracking.objects.get_or_create(user=user, program=prog)

        self.stdout.write(f'  demo user: aarav@kernel.dev / kernel123 ({"created" if created else "exists"})')
