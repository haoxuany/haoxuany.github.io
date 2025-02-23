---
layout: post
title: How to Dislike Constructive Mathematics Correctly
date: 2025-02-22
description: where I attempt to start an Internet flame war
tags: logic, math, philosophy
categories:
tabs: true
related_publications: true
giscus_comments: true
---

I am going to quickly go over, at a very elementary level, what constructive mathematics is all about. Unlike all the other stuff I plan to blog about, this material is decidedly *not* technical, and I plan to keep the discussion strictly at a **high school** level. There will be no technical discussion of proofs in type theory or logic, and all proofs are phrased in English in a way that can hopefully be appreciated by everyone, using only basic arithmetic and logic.

The main reason I'm writing this is that I finally got annoyed enough by the occassionally bizarre comments by certain mathematicians about why they don't like constructive mathematics, why the law of excluded middle is critical, and why most of mathematics cannot be done without it. Most of these statements are **false** (here comes the angry mob), and the very point of this post is to do some mythbusting.

To make my biases clear: I *do* believe in constructive mathematics, for reasons related to computer science and type theory. That said, I don't think that classical mathematics is *wrong* per se, nor can it ever be, which will be validated in the development below. But in a precise sense, it is **worse**. My main issue is that a number of people dislike constructive mathematics for the *wrong reasons* due to some fundamental misunderstandings, even in the elementary development below. Clearing that up is the point of this post.

If you have any basic knowledge in modern logic, type theory, or programming languages, this post is not for you. Yes, I am aware there are different schools of constructivism, and it is not the point of the post to discuss these finer points. If you have the background, there are no new ideas here and a much more detailed explanation can be found in a good textbook in logic. Reading my explanations would just be preaching to the choir.

That said, allow me to quickly quote Andrej Bauer in his [very excellent talk about constructive mathematics](https://www.youtube.com/watch?v=21qPOReu4FI) out of context:

> If you don't believe me, you can type it into Coq.

Which is exactly what we are going to do. We will give two descriptions: one in English (for those who aren't familiar with type theory), and one in Coq (for those who don't believe me, and to not so subtly illustrate a specific point later).

# Some Basic Definitions

We start with some very basic definitions.

> Definition: a **proposition** is a statement of some sort.
{: .block-tip }


Yes I am aware that this is a bad definition, since there are technically some restrictions on what can be a proposition, but that is besides the point here. We will survive with this for now. Note that this is phrased deliberately to avoid wording it the other (wrong) way.

> Definition: A proposition is **true** if there is a proof of it.
{: .block-tip }

Again, we don't explicitly define what a proof is. There are some technical reasons to avoid doing so (Godel's Incompleteness), and we won't be concerned about them here.

For convenience, we call this definition **Proof of a Truth**, aka to show that a proposition is true, we prove it.

This brings us to our first theorem:

> Theorem: There are some true propositions.
{: .block-tip }

{% tabs true-prop %}

{% tab true-prop English %}

Proof: $0 = 0$ is a true proposition. It is true by this proof: we use the von Neumann definition of natural numbers, in which case this is equivalent to the statement that $ \emptyset = \emptyset $, which is true by axioms of set theory about equality of sets.

{% endtab %}

{% tab true-prop Coq %}
The type theoretic version isn't nearly as contrived.

```coq
Theorem zero_id : 0 = 0.
Proof. reflexivity. Qed.

Theorem true_p_exists : exists p, p.
Proof. exists (0 = 0). apply zero_id. Qed.
```
{% endtab %}

{% endtabs %}

> Definition: A proposition is **false** if assuming that it is true, we can derive a contradiction.
{: .block-tip }

This is an important point: the term contradiction is *not prohibited* in constructive mathematics. A contradiction is simply a proposition that is always false. It is a weirdly common misconception that these proofs are not allowed in constructive mathematics, even though they are decidedly not controversial in any school of constructive mathematics that I know of.

For convenience, we call this definition **Proof of a Contradiction**, aka we are proving that a contradiction exist, and therefore the proposition is false by virtue of what is means for something to be false.

> Theorem: There are some false propositions.
{: .block-tip }

{% tabs false-prop %}

{% tab false-prop English %}

Proof: $1 = 0$ is a false proposition. It is false by this proof: suppose that it is true, then we have $f(1) = f(0)$ for any function $f$. Let $f(x) = \emptyset \in x$, thus we know that $\emptyset \in 1$ but $\emptyset \notin 0$, and hence they cannot be equal, contradiction.

(Yes I am aware this is contrived, and it is not the only way of proving this.)

{% endtab %}

{% tab false-prop Coq %}
The type theoretic version isn't nearly as contrived.

```coq
Definition zero_eq_one : Prop := 0 = 1.
Theorem zero_eq_one_false : not zero_eq_one.
Proof.
  unfold not. intros.
  inversion H.
Qed.

Theorem false_p_exists : exists p, not p.
Proof.
  exists zero_eq_one. apply zero_eq_one_false.
Qed.
```
{% endtab %}

{% endtabs %}

> Theorem: There are some propositions that are either true or false.
{: .block-tip }

{% tabs true-false-prop %}

{% tab true-false-prop English %}

Proof: $0 = 1$ is a true proposition, as shown above. Therefore it is either true or false.

{% endtab %}

{% tab true-false-prop Coq %}

```coq
Theorem true_or_false_p : exists p, p \/ not p.
Proof.
  exists (0 = 0). left. apply zero_id.
Qed.
```
{% endtab %}

{% endtabs %}

> Definition: A proposition that is either true or false is called a **decidable proposition** (or sometimes, **boolean proposition**).
{: .block-tip }

For example, $0 = 1$, $0 = 0$ are both decidable propositions, as proven above.

> Theorem: Any proposition cannot be both true and false.
{: .block-tip }

{% tabs both-bool-prop %}

{% tab both-bool-prop English %}

Proof: Suppose that $p$ is some proposition that is both true and false. Because it is true, there is some proof of it, call it $A$. Because it is false, then by definition, assuming that it is true, you can derive a contradiction. But because we have a proof that it is true ($A$), we can feed it into the proof that it is false, and derive a contradiction.

{% endtab %}

{% tab both-bool-prop Coq %}

```coq
Theorem not_both_true_false : forall p, not (p /\ not p).
Proof.
  intros. unfold not.
  intros Hpboth. destruct Hpboth as (Hptrue & Hpfalse).
  apply (Hpfalse Hptrue).
Qed.

```
{% endtab %}
{% endtabs %}

So far everything is believable? Congratulations, you now believe in constructive mathematics!

# The Problem

So the real question here is: what is classical mathematics? In classical mathematics, everything I've written above is believable. The problem is that in addition to all those definitions, it also believes in one more proposition called the Law of Excluded Middle (LEM).

> LEM: For *every* proposition $p$, it is either true or false. In other words, *all* propositions are decidable/boolean.
{: .block-warning }

Now this statement is much more problematic. We have already shown that decidability does hold for *some* propositions ($0 = 0$, $0 = 1$), but LEM states that it holds for *every* proposition, and that is the distinguishing feature of classical mathematics. Before we go further, we shall first establish some facts about it.

### Equivalence with Double Negation

There is a slightly different statement of LEM, called Double Negation Elimination (DNE), that says:

> DNE: For *every* proposition $p$, if $p$ is false is false, then it is true. In other words, if assuming that $p$ is false, we end up deriving a contradiction, then it is true.
{: .block-warning }

Note that intuitively this is also a departure from constructive mathematics. In constructive mathematics, to show that a proposition is true requires giving a proof of it. With DNE in classical mathematics on the other hand, instead of actually proving the proposition, your argument can instead end up looking like this:

> Suppose that $p$ is false, fill in reasoning here, contradiction.
{: .block-danger }

This is what is sometimes called **Proof by Contradiction**. Contrast this with **Proof of a Contradiction** above: they are proving decidedly different things. A **Proof of a Contradiction** tries to prove that a contradiction exists, by the very definition of what it means for something to be false. A **Proof by Contradiction** does something a lot more sneaky: to prove that $p$ is true, it tries to first assume that the statement $p$ is inconsistent/false, prove that it can't be false, and uses DNE to conclude "because it can't be false, therefore it must be true". Sometimes people also call proofs of this kind **indirect proofs**: instead of proving it directly, it gives a proof of why the proposition cannot be falsified.

**Proof by Contradiction** is what we avoid in constructive mathematics. **Proof of a Contradiction** on the other hand is perfectly fine, since it is just a definition.

A highly important theorem is that LEM and DNE are equivalent: if you believe in LEM, then you must believe in DNE, and vice versa.

> Theorem: LEM and DNE are equivalent.
{: .block-tip }

{% tabs lem-dne-prop %}

{% tab lem-dne-prop English %}

Proof: (LEM => DNE) Suppose that LEM holds, let $p$ be any proposition, and we need to show that if $p$ is false is false, then it is true.

Suppose that $p$ is false derives a contradiction. Because LEM holds, $p$ is also either true or false. We look at both cases since we don't know whether it is true or false.

If $p$ is false, then by assumption in DNE, we derive a contradiction, and from a contradiction we can derive anything (ex falso quodlibet), so we derive that $p$ is therefore true.

If $p$ is true, we are done.

Hence in all cases, we know that $p$ is true.

(DNE => LEM) Suppose that DNE holds, let $p$ be any proposition, we need to show that $p$ is either true or false, aka $p$ is decidable.

It suffices to show that (($p$ is decidable) is false) is false, then by DNE, we get the final result.

In other words, it suffices to show that it is not the case that $p$ is decidable is false (or the decidability of $p$ cannot be falsified). Which we will show two sections later.

{% endtab %}

{% tab lem-dne-prop Coq %}
```coq
Theorem lem_dne_equiv : LEM <-> DNE.
Proof.
  split; intros; unfold LEM in *; unfold DNE in *; unfold decidable in *.
  (* LEM -> DNE *)
  - intros p Hnotnotp.
  specialize (H p).
  induction H.
  + assumption.
  + specialize (Hnotnotp H). destruct Hnotnotp.

  (* DNE -> LEM *)
  - intros.
    apply H.
    apply lem_not_false.
Qed.
```
{% endtab %}

{% endtabs %}

### LEM cannot be proven within constructive logic (in particular, intuitionistic logic)

There is a proof of this, but it is fairly involved, since it is reasoning about metatheory (aka the proof system itself). Bob Harper once mentioned that it is usually not too hard to show that you *can* prove something, but it is generally very hard to show that you *cannot* prove something, since it almost always involves some kind of trick, which is the case here.

This was first done by Gerhard Gentzen in {% cite Gentzen1935 %}, which was written in German so I can't actually read it. Instead, I will refer to the excellent notes {% cite Pfenning2023 %} by Frank in his course where I first learned this argument.

Here's a high level sketch: you can prove that the natural deduction style of intuitionistic logic is equivalent to the sequent calculus LJ. Then by induction on the rules within sequent calculus, show that LEM cannot be proven by exhaustively running through all cases. Since it cannot be proven in LJ, it thus cannot be proven in natural deduction.

Using the same technique, you can also prove that false is not provable within LJ, and therefore not provable in natural deduction. Hence intuitionistic logic is also internally consistent. A similar technique can also be used to prove internal consistency for classical logic, and was what the original paper did.

What is important here is the implication: there is *no* proof of LEM, and therefore, **no mathematical justification for it can possibly exist**. The only way of accepting LEM, if we were to do so, is to accept it as an *axiom*.

### Decidability is not Falsifiable

This is a very subtle point: you can prove that for every proposition $p$, decidability for it cannot be false.

> Theorem: For any proposition, decidability is not false.
{: .block-tip }

{% tabs lemnotfalse-prop %}

{% tab lemnotfalse-prop English %}

This proof can be a bit confusing. Given any proposition $p$, it suffices to prove that if $p$ is undecidable (aka not decidable), then we derive a contradiction. Assume that $p$ is undecidable, and call this fact Hpnotdecidable. We split this to two steps.

($p$ is false). We first show that $p$ is false. To see this, suppose that $p$ is true, then by definition, $p$ is decidable. However, $p$ is not decidable by Hpnotdecidable, contradiction. Hence, $p$ is false.

(A contradiction). Since we've just shown that $p$ is false, by definition, $p$ is decidable, however, by Hpnotdecdiable, $p$ is not decidable, contradiction.
{% endtab %}

{% tab lemnotfalse-prop Coq %}

```coq
Theorem lem_not_false : forall p, not (not (decidable p)).
Proof.
  unfold not.
  intros p Hpnotdecidable.

  assert (not p).
  - unfold not. intros.
    assert (Hpdecidable : decidable p).
    { left. assumption. }
    apply (Hpnotdecidable Hpdecidable).

  (* not (decidable p) /\ not p => False *)
  - assert (Hpdecidable : decidable p).
    { right. assumption. }
    apply (Hpnotdecidable Hpdecidable).
Qed.
```

{% endtab %}

{% endtabs %}

So what does this actually say? To say that that decidability is not false is exactly as what the definition implies: pick any proposition $p$, you cannot prove that decidability is false. Or more literally, you cannot have some third value that is neither true or false.

What it does **not** imply, is that you can prove decidability is true, or in other words, $p$ is either true or false. This can be particularly vexing. Previously I mentioned that LEM cannot be proven within constructive mathematics at all, the very definition of what it means to be true. To reemphasize, unless the proposition is **decidable**, you cannot conclude that it is true simply by showing that it cannot be false, since it requires you to use DNE.

Here's how I think about it intuitively: give me any proposition $p$. Regardless of what $p$ is, it cannot be something other than true or false. But does it allow me to conclude that $p$ must be either true or false? **No**. Because a proof of $p$ cannot be neither true nor false is too *weak* to make this conclusion. Very early on we have established what it means for a proposition to be true and what it means for a proposition to be false, and this proof **does not satisfy either requirement**: it gives me neither a proof of $p$ nor a proof of $p$ is false. DNE is the magic hoop to jump from a weak proof like this to a much stronger one, but we are not allowed to use it.

Here's a subtlety: what this also says is that constructive mathematics does not, and cannot, believe that LEM is false. In particular, it does not, and cannot, postulate something as ridiculous as a 3rd option. But the point of constructive mathematics is to say that we don't believe LEM is true either, because there is no possible proof of it, per Gentzen. And therefore we cannot use it since we cannot trust it.

It just occured to me: here's a truly crazy sounding subtlety since what I wrote can seem very self contradictory. I highly recommend that you skip this particular paragraph unless you have seen these ideas before. Here I've just shown that you cannot prove for any proposition, that it is undecidable. But isn't LEM undecidable? It cannot be true because Gentzen proved that it is not provable. It cannot be false because decidability is not falsifiable for any proposition. Therefore it is undecidable, yet we've just shown such a proof of undecidability cannot exist for any proposition, and LEM is a proposition. So what went wrong? In short, it has to do with *where* the proof is done. The proof I wrote in this section is the statement that you cannot prove undecidability *within the object language*. Gentzen's proof is done with the *metalanguage*, aka, reasoning *about* the language rather than *in* the language.

# The Arguments About LEM

Given that we cannot prove LEM, the direct consequence is that arguments for including LEM as an axiom become entirely a matter of **philosophy**, since there is nothing *mathematics* can do here. Here I discuss some of them that I know of, though this is likely not an exhaustive list.

### If it is not true, and it is not false, then what is it?

This is a really good question and a great source of confusion for folks looking at these results for the first time. Myself included, many many years ago, when I was 19. It really shows that I'm getting old. There are true propositions, there are false propositions, but then bizarrely, there are propositions that are not quite either, even though it is not possible to have a third value either. So for those propositions, exactly what are they?

The way I understand it is to quote one of my favorite propositions: [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture). Collatz Conjecture states that: start with some positive natural number $x$. If it is even, divide by 2 $(x / 2)$. If it is odd, multiply by 3 and add 1 $(3x + 1)$. Keep repeating this procedure until you end up with the number $1$. Is there any $x$ where it will never end up with $1$ no matter how many times you repeat this procedure? The conjecture posulates that all positive natural numbers will end up with $1$ eventually.

This is one of my favorite propositions because it is particularly easy to explain to anyone with any amount of understanding of elementary school mathematics. It also comes in handy to emphasize a particular point about decidability. Moreover, it makes for a very fun prank to pull on your more mathematically guillible friends if they don't know that this problem is still unsolved after almost a century at this point.

Now, we can ask:

- Is Collatz Conjecture true? If so, surely you can give me a proof of it.
- Is Collatz Conjecture false? If so, surely you can give me a number where it doesn't end up with a 1 at the end of this procedure.
- Is Collatz Conjecture neither? No.

But to emphasize a point: practically nobody denies that this is a **valid proposition**, despite that it resisted multiple attempts over generations of mathematicians to find an answer.

This example illustrates what constructive mathematics is *really* all about. It is, in essence, saying that the *only* criteria of truth is a proof of it. In particular, a human proof that you can write it out and give it to me. If you can give me a proof, it is true. If you can give me a proof that it leads to an inconsistency, and the system is internally consistent, then it is false. If you cannot, then nothing can be concluded about the proposition at all. Hence, mathematics is a human activity. Solved problems are decidable, whereas unsolved problems are not yet known to be decideable.

So in this light, what does LEM say, constructively? It says that *all* propositions can either be proven, or it can be proven to be false. What does DNE say, constructively? It says that given proposition $p$, if I can prove that no such proof of a contradiction exists, then a proof of $p$ *must exist* or *be accepted*.

### How to Believe in LEM

This brings us to what I thought to be the most coherent argument for LEM that I know of philosophically. There exists some Oracle (some people use the terminology "God". I deliberately avoid this term because it tends to give off religious vibes despite religion having nothing to do with this) who knows all and sees all. That given a proposition, there is some "inherent" (or "objective") mathematical truth out there no matter what the proposition is, the Oracle (be it some deity, or just the Universe itself) decides whether it is true or false and knows the reason, whereas humans are just too foolish to see them without plenty of time, effort and dedication. So mathematics is not a human activity, but an exercise in discovering what is known to the Oracle. We have some known proofs for some propositions, but there are a lot of propositions that we don't know is true or false, even though a proof is there by the Oracle/Universe and we have yet to discover it.

Now there is nothing wrong with this belief, since this is fundamentally a philosophical stance. Given that classical logic is internally consistent, there isn't really a right or wrong here. Personally, I found this perhaps too optimistic that all mathematical truths have some inherent solution somewhere.

If you do hold this belief, I think that this is a truly valid reason to dislike constructive mathematics, since the notion of truth being relative to human advancement can be unpalatable to some. Weirdly enough, most people who have objections to constructive mathematics that I've talked to seem to not hold this view either.

### The Practicality of Avoiding LEM

Another often cited reason is that LEM cannot be avoided in mathematics. I found this to be highly suspect at best. There are two ways of avoiding LEM:

#### Try and find direct proofs of theorems

There are a few fields where it was once thought that LEM is necessary, the more famous of them being Analysis. Even more famously, Errett Bishop managed to find constructive proofs for a lot of theorems, but they generally requires redoing a few definitions. {% cite BishopBridges %}

It also turns out that most proofs in the wild are already constructive. When you try to prove something, what comes to mind is usually *not* "Suppose that the proposition is false, ...". If you want to prove that a sorting algorithm exists, you give the sorting algorithm. You don't generally say "Suppose that no algorithm exists, ...., but it cannot be".

#### Rephrasing the theorem

Suppose that you have some proposition $p$, where your proof critically depends on $q$ being decidable. Yet you are unable to prove that $q$ is decidable (say $q$ is Collatz Conjecture, $P = NP$, pick your favorite unsolved problem). What do you do?

A simple fix is to rewrite your theorem so that your proof is valid in constructive logic. In short, instead of saying that you managed to prove $p$, say that you managed to prove "assuming that $q$ is decidable, $p$ holds". This is a weaker statement, but the proof becomes perfectly valid without assuming LEM, because you stated it as an assumption. Similarly, when instead of giving a Proof of a Truth, you ended up giving a Proof by Contradiction, you can always rewrite your theorem to say that you managed to prove "it is not that case that $p$ is false". This is sometimes called the Double Negation Translation.

What you don't want to do is state that "Assuming LEM holds (aka, assuming that all propositions are decidable), $p$ holds". Because as shown by Gentzen, LEM is not provable. However, decidability of $q$, be it true or false, is something you *might* have some hope of proving in the future. If someone managed to prove decidability of $q$ at some point, you can plug in that proof and the requirement is no longer necessary anymore. Alternatively, you can even go as far as to state decidability of $q$ as an axiom, which can save you the hassle of repeating this requirement in every subsequent theorem that uses the result of $p$. It still gives you a stronger proof than using LEM outright.

### Historical Reasons

Finally, here is what I think to be the real reason why so much of mathematics lean towards classical: because people were taught that way. And their teachers taught them that way. And the teachers of those teachers taught them that way, sometimes repeating a bunch of misconceptions. I have seen, even today, a rather horrifying number of textbooks in elementary mathematics stating that "a proposition is a statement that is either true or false", in actual departments of mathematics of all places, despite that the notion of a proposition should be a priori to the notion of truth. (Yes, I am aware that historically this is not the case, but Gentzen has shown through the sequent calculus that LJ is perfectly consistent without needing to resort to LEM, meaning that the notion of a proposition is, in fact, not related to the notion of truth at all. See this [Hall of Shame](https://www.google.com/search?q=definition+of+proposition+in+math) asserting the contrary) And at the very top of the tree stands David Hilbert, who very (in)famously made this mysteriously oft repeated quote:

> Taking the principle of excluded middle from the mathematician would be the same, say, as proscribing the telescope to the astronomer or to the boxer the use of his fists. To prohibit existence statements and the principle of excluded middle is tantamount to relinquishing the science of mathematics altogether.

Now there is a fair bit of [mathematical history in the Hilbert-Brouwer controversy](https://en.wikipedia.org/wiki/Brouwer%E2%80%93Hilbert_controversy) that is more entertaining than it is informative, as a lot of the arguments ended up disintegrating into personal attacks than anything at all related to mathematics. Ignoring that, it did not seem to me that Hilbert was really making a philosophical argument of any sort, but rather is more of a statement about the (lack of) practical value in doing mathematics without LEM.

And if that was the point he was trying to make, we can very conclusively say today that Hilbert was simply **completely wrong**. There are extremely good, practical reasons to not use LEM.

# Why Not Believe in LEM

### Fewer Axioms Means Better System

This is a very simple fact: the fewer axioms or assumptions you have, the better your theorems are.

Consider any proposition $p$, and any proposition $q$. The proposition "$p$ is true" is simply a stronger statement than the proposition "assuming that $q$ is true, then $p$ is true". In particular, the former implies that latter.

> Theorem: For any propositions $p$, $q$, if $p$ is true, then $q$ implies $p$ is true.
{: .block-tip }

{% tabs weaken-prop %}

{% tab weaken-prop English %}

Proof: Suppose that $p$ is true, we show that if $q$ is true, then $p$ is true. Ignore $q$, we already know $p$ is true.

{% endtab %}

{% tab weaken-prop Coq %}
```coq
Theorem weaken : forall p q, p -> (q -> p).
Proof.
  intros.
  assumption.
Qed.
```
{% endtab %}

{% endtabs %}

The other way around does not hold, there are cases where $q$ implies $p$ is true, but $p$ is not true. For example:

Theorem: "$0 = 1$ is true implies $1 = 2$ is true", but $1 = 2$ is false.

{% tabs inversefail-prop %}

{% tab inversefail-prop English %}

Proof: ($0 = 1$ is true implies $1 = 2$ is true) Suppose that $0 = 1$ holds, then so does $f(0) = f(1)$. Let $f(x) = 1 + x$, then we have $1 + 0 = 1 + 1$ aka $1 = 2$.

($1 = 2$ is false) Suppose that $1 = 2$, then $f(1) = f(2)$. Let $f(x) = x - 1$, hence we have $1 - 1 = 2 - 1$, so $0 = 1$, which we have shown earlier, is false, and hence derives a contradiction.

{% endtab %}

{% tab inversefail-prop Coq %}
```coq
Theorem inverse_fail : ((0 = 1) -> (1 = 2)) /\ (1 <> 2).
Proof.
  split.
  (* 1 = 2 *)
  - intros. f_equal. assumption.

  (* 1 <> 2 *)
  - unfold not. intros. inversion H.
Qed.
```
{% endtab %}

{% endtabs %}

In this sense, $p$ is true is simply a "better" or "stronger" theorem most of the time. Now take $q$ to be the law of excluded middle. All this says is that a proof that doesn't use LEM is simply a stronger proof than one that uses it, and hence in this sense, proofs constructively are better than ones that do depend on LEM, because there are fewer assumptions.

### Proofs as Programs

So going back to the train of thought (inadvertently) proposed by Hilbert. Is there any practical merit to avoiding LEM? The answer here is definitively, **yes**.

Here's a sketch: if we cease viewing propositions are just true or false, what do we get? In short, we get structure. Propositions are not just statements of true of false, and proofs are not just results of true or false. Instead, proofs themselves are mathematical objects. Propositions can then be thought of having "content", the content being proofs. In this sense, a proposition can have multiple proofs, some proofs can be the same and some different, by a certain definition of what it means for two proofs to be the "same". You can also stack two proofs together to make new proofs. For example, if you have a proof of $p$ implies $q$ (call the proof $A$), and $q$ implies $r$ (call the proof $B$), then stacking $A$ and $B$ together gives you a proof of $p$ implies $r$.

In the classical world, this will unfortunately end up degrading into truth tables in a way: you look at the table for $p$ implies $r$ and all combinations of true or false for $p, q, r$, then you pick, using LEM, which boolean it results in (if it's not false, well, it must be true then). But if we don't use LEM, then we are forced to work with proof structure, and hence we must treat proofs as mathematical objects.

What kind of mathematical objects? In short, they are computer programs. And what are the propositions? They are just the types of the programs. And just like that, checking that your proof is correct is **just** a matter of making sure that your program is typechecked, which a computer can do almost automatically practically most of the time today. Hence, all of mathematics is simply just a programming exercise, as long as you have a sufficiently good language to work in.

Now I am significantly simplifying this description since I promised that this post is nontechnical, there are actually different kinds of foundational issues that you end up with in this line of thought. What I just described is a tiny fragment of what is sometimes called the [Brouwer-Heyting-Kolmogorov interpretation](https://ncatlab.org/nlab/show/BHK+interpretation) (the actual intepretation goes far beyond just programs, there is also a correspondence in category theory). More importantly, **this intepretation is the very foundation of the study of Type Theory, or in other words, the study of programming languages today**. A lot of this in clarified in Per Martin-Lof's seminal paper: Constructive Mathematics and Computer Programming {% cite MartinLof82 %}, the single most important paper in programming languages today, and what I would argue, one of the most important papers in all of computer science.

One thing to stress: **this is not just theoretical**. I wrote all the proofs above in Coq, but *why* does Coq work? Because Coq is based on Martin-Lof Type Theory. And why do you believe proofs typed out in Coq have anything to do with the proofs I did in English? The short answer is Martin-Lof's paper, and to trace it back, the ideas in BHK itself. And to sum it up, it is because proof checking reduces to *just* a type checking problem per BHK. Practically, Coq is extremely successful (from a certain perspective, unfortunately a bit too successful, but that's an actually technical post for a different day), so successful that one of the extremely long proofs that was unrealistic to check by humans, the Four Color Theorem, was finally machine checked without objections [in Coq](https://github.com/coq-community/fourcolor). Any argument you can make against the proof, is an argument you make against either Coq's implementation, or the foundations of Type Theory itself.

Contrast this with the horrible mess that is taught today in certain computer science departments on software testing methodology, that actively encourages you to write bad code in garbage languages, and end up ensuring "correctness" by writing tests that needed to be run continuously instead of checking them once during typechecking, wasting CPU resources, despite being able to ironically prove, for sufficiently interesting types (aka most of the time, for simplicity, pick the natural numbers), that **testing can never be complete** (exercise for the reader, this can be formalized precisely: given a (finite) list of test cases, pick a type ($\mathbb{N}$) and a function for the type ($\mathbb{N} \rightarrow \mathbb{N}$), and pick some simple property (ex. function computes the successor), show that no finite list of test cases will ever cover the property for all inputs by constructing an adversary implementation for the function (easy, iterate over the list of test cases, find a natural number that isn't there. It must exist because test cases are finite. Construct the right function behavior for every input except for that number. The function passes all tests cases, but is wrong)). Because this quantifies across all possible list of test cases, simply put, unless your code is boring (as in all types have finite number of values), **no amount of testing ever means anything**. This proof is so intuitive to do you can ask a high school student to come up with it within a few minutes, yet the pointlessness testing methodology is emphasized over and over again in so many universities, despite what they really want, is merely as *simple* as a good language.

So what happens if we add LEM as an axiom in Coq? Without going into technicalities, in short, the programs (or proofs) won't *run* in a sense. When you have a proof that "there exists some $x$, where $x + 1 = 3$", then a constructive proof will mention somewhere that it holds for "$x = 2$", because it is a direct proof. *Running* it will give you concretely, $x = 2$ as an answer. However, if you start your proof with "Suppose on the contrary that it is the case that every $x + 1 \neq 3$", ...", there's a very good chance that you don't end up getting a concrete value for $x$, and in this way, the program gets "stuck" (not quite, but that's a different topic). This has some highly annoying consequences for typechecking, especially for dependent types. In this pragmatic sense, having LEM in the system is really inconvenient.

### Technicality: Inconsistency with Higher Inductive Types + Univalence

Unfortunately, this particular point likely cannot be explained without some specialist knowledge. If you are not interested, feel free to skip it.

In Homotopy Type Theory, there is a theorem that states that you can derive a contradiction with both LEM and the Univalence Axiom in the system. The only proof that I know of (but don't recall) involves a construction using Higher Inductive Types. I probably won't be able to reproduce this proof on top of my head anymore, since I recall it requires a bit of brilliance by constructing "swap" paths on a boolean.

In either case, there is a concrete result here, is that if we ever want Univalence, constructivity is not just optional. LEM needs to be completely avoided.

# In Closing: A Personal Belief in Making the Right Arguments

There is nothing inherently wrong with disliking constructive mathematics, but it is important to have technically correct reasons to do so and to make an effort to not misrepresent it. It is simply, *not* a belief of constructive mathematics to never mention the word "contradiction", and the claim that constructive mathematics make it impractical to do math is simply wrong. The majority of mechanized mathematics today is developed in type theory, constructively. And whatever your arguments are for LEM, it is certainly not inherently mathematical, but philosophical, so it is a matter of opinion. Unfortunately, the number of times I've heard a technically wrong argument against constructivism at an elementary level significantly dwarfs the number of times I've heard a legitimate one, even if it is something like "because I was taught to do so by my professors/textbook". I would like to invite the reader, regardless of what your opinions are, to hold everyone (including myself) up at at least this level of standards.

Wow this is way too long. Hopefully this is the last time I write about philosophy, as it is generally not something I do. Now I can go back to technical writing about programming languages instead.
