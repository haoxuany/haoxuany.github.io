---
layout: post
title: Thoughts on Standard ML
date: 2026-01-30
description: here we go again
tags: programming
categories:
tabs: true
related_publications: true
giscus_comments: true
---

So as I am very quickly getting old and washed, people who are close to me might know that I'm in the process of writing my own SML compiler. Much like most one man projects that need to juggle an irrelevant day job and this, it is going extremely slowly. But this post here is to mostly dump my thoughts in case I forget about them one day (which, as you are getting old and washed, happens).

The elephant in the room is that there are likely more than 10 different compiler implementation for SML out there, and they are all (annoyingly) different and specializes in most things that you can think of, so why write one more when there are already pretty good implementations out there? (My personal favorite implementations are the New Jersey compiler, SML#, and Rossberg's HamLet).

A few years ago I was working on a similar ML compiler, but decided to scrape it, because I regretted certain implementation strategies that I did. The internal type theory is quite similar to the one in TILT, but for a number of reasons on top of my head it was unsatisfactory for seperate compilation in too many ways. But more importantly, I wanted to fix certain things in the *language*, from scratch.

There are three main goals in my mind:
1. To fix some of the language to be more consistent with Harper-Stone.
2. To implement dictionary construction for modules.
3. To have a "good enough" implementation of seperate compilation, independent of the module system (aka. unlike OCaml). For example, something similar to {% cite SMCH2006 %}.

Hence this is a rant about some stuff I don't like in Standard ML, and on top of my mind, what is the right way to fix it. Of course, I really like the language (as any minimally competent programmer does); I wouldn't bother to talk about it otherwise.

# What is Standard ML?

When I think of Standard ML, there are two well known papers that stand out on top of my head:
- Harper-Stone Elaboration {% cite HarperStone2000 %}
- The Mechanized Metatheory of Standard ML {% cite LeeCraryHarper2007 %}. The paper doesn't have complete details because the proof is quite large, so you'd need to look at the Twelf proof.

These papers are also based on the PhD thesis of Dreyer on recursive modules. {% cite Dreyer2005 %}

If there is one thing I *don't* care about, it is the original definition {% cite Defn2nd %}. The definition is noble in its goals at the time, but pretty problematic in retrospect. It's not just the tiny things, but overall in methodology on how the language is defined. The wonderful thing about Harper-Stone is that it translates the language into proper objects in type theory, so that it can be actually studied, and type safety (and surprisingly, even parametricity {% cite Crary2017 %}) can actually be proven. I personally think that this fact alone makes it the canonical view of ML.

There's also this other paper by Sterling-Harper, but quite frankly I don't understand it after years of trying. {% cite SterlingHarper2021 %}

Then there's the Rossberg-Russo-Dreyer F-ing Modules paper {% cite RossbergRussoDreyer2010 %}, which basically attempts to elaborate away all modules. Technically there's nothing wrong with the paper, but I don't hold this view. I consider modules as proper type theoretic objects. They are basically dependent sums with restrictions.

# The Well Known Problems

Most people who write any real amount of code probably already know, or seen, many of the problems. An excellent comprehensive list is given in [Rossberg](https://people.mpi-sws.org/~rossberg/papers/Rossberg%20-%20Defects%20in%20the%20Revised%20Definition%20of%20Standard%20ML%20[2013-09-18%20Update].pdf). These issues are largely uncontroversial on their own, but the correct fix on the other hand can be. To list out a few (out of many) that I do plan to address slowly while I'm here anyway:

- Parsing bugs, a lot of them. Many shift-reduce conflicts, and some horrific reduce-reduce conflicts in the case of `<match>`. These mostly involve changing some of the syntax and is more annoying than it is difficult to fix. I'm personally happy as long as all such conflicts are avoided as much as possible, which generally involves adding a reserved word in expressions, declaration, etc.
- eqtype needs to die. It is questionable to do equality checks in the first place, but it should absolutely not be in the language.
- Fixity is very messy in the language. I haven't decided exactly what to do here yet, as it seems that whatever I end up with will piss somebody off one way or the other regardless.
- Some stuff could definitely be more general, or nicer. For instance, being able to define extension types that are not `exn`. Some syntatic sugar on working with products/records. Having/Being able to define a `void` type as an empty datatype. Some syntatic sugar like `M.(e)` = `let open M in e end` like in OCaml. Removing positional argument syntax in functors. Higher order functors. Cleaning up the syntax for type sharing. The list goes on and on.
- Having a seperate compilation system that doesn't depend on modules.

To me, these are mostly the minor annoying problems, and boils down to spending a very long time writing a lot of implementation code. There are, however, two major problems that I want to address, which had been stuck in my head for years ever since and is what I will actually talk about. These two issues have led me to conclude that the right way forward is to ignore backwards compatibilty altogether and start from scratch, because it will require a rethinking of how to structure libraries anyway. I can't say I have a complete solution in my mind already, so this should be considered a sketch.

# Issue 1: Syntatic Patterns and Datatype

One of my biggest gripes with the language is not being able to define syntatic patterns for a type. Let me explain how I came to this particular conclusion, but you will have to bear with me since this will take a while.

In Harper-Stone elaboration, datatypes are just modules. This is a very nice view of datatypes, because it seperates out what datatype is actually doing within the internal language into disparate parts. A datatype is a module with an abstract type, a constructor, and a pattern (or destructor, if you will). For example:
```
datatype foo = Foo of int | Bar of string
```
is actually (I will make up some concrete syntax for the internal language to make it nicer to read):
```
structure Foo :> sig
  type t (* = mu.(int + string) *)

  val Foo : int -> t
  val Bar : string -> t

  val expose (* pattern for t *) : t -> (int[Tag Foo] + string[Tag Bar])
end = struct ... end
```

Basically there is an abstract type `t` that is internally implemented with a recursive sum, two constructors (aka just functions), and one pattern/destructor `expose` (aka also just a function). The `expose` function is applied every time pattern matching happens. (Let's ignore equality for time being. I'll get to it when I talk about the next issue.). For example:
```
case foo : foo of
| Foo.Foo x => e1
| Foo.Bar y => e2
```
becomes
```
case[int + string] Foo.expose foo of
| InjFoo v => (fn x => e1) v
| InjBar v => (fn y => e2) v
```
From the Harper-Stone perspective, what struck me when I first read it, is that it is a huge shame there is no way to syntatically express patterns for the type in the concrete language (like `expose` here). This turns into certain bizarre artifacts when writing code that happens more often than people think.

The most annoying place where this shows up is when people put a `datatype` in a signature. I generally avoid putting `datatype` in signatures because of what the definition requires. Suppose I am writing, say, a signature for `STACK`. At this point, I have to make a decision. The first cut, I can do:
```
signature STACK = sig
  datatype 'a t = Empty | Stack of 'a * 'a t

  val push : 'a t -> 'a -> 'a t
  (* and etc. *)
end
```
This type is clearly isomorphic with the type of lists, but it isn't a list. It can be represented as a list, so what I want to be able to write, following Harper-Stone, is:
```
structure StackList :> STACK = struct
  type 'a t = 'a list

  val Empty = Nil
  val Cons (h , t) = Stack (h , t)
end
```
And now I'm stuck for two reasons:
Reason 1) This doesn't typecheck, because 'a t needs to be a datatype.
Reason 2) I can't write code in the surface syntax for patterns.

Therefore, to deal with these two problems today, what I can do is to change the signature to remove `datatype` and use an abstract type, and to have some "view" type for the pattern. For example, the signature needs to be:
```
signature STACK = sig
  type 'a t

  val empty : 'a t
  val push : 'a t -> 'a -> 'a t

  datatype 'a view = Empty | Stack of 'a * 'a t
  val elim : 'a t -> 'a view
end
```
I found this problematic for two reasons. The first has to do with more complex pattern matching. For instance, if I want to check that some `s : int stack` has `1` and `2` at the top of the stack, what do I do? I want to write:
```
case s of
| Stack (1 , Stack (2 , rest)) => e (* do something *)
```
except that because my views are (potentially) lazy, this won't work, so you'd need to do something like
```
case elim s of
| Stack (1 , s) =>
  case elim s of
  | Stack (2 , rest) => e
```
And at this point, you have effectively *become the compiler*, compiling everything yourself.

The second reason has to do with what this actually looks like in the internal language. Suppose I have some implementation:
```
structure S : STACK = sig
  type 'a t = 'a list

  datatype 'a view = Empty | Stack of 'a * 'a t
  fun elim s =
    case s of
    | Nil => Empty
    | Cons (h , t) => Stack (h , elim t)
end
```
Because `'a view` is also a `datatype`, the internal language of Harper-Stone looks like
```
structure S : STACK = sig
  structure List = List
  structure View = struct
    type 'a t (* = mu x.fn x => 1 + 'a * 'a x *)

    val Empty : 'a t
    val Stack : 'a t -> 'a -> 'a t
  end

  open List View

  fun elim s =
    case List.expose s of
    (* ... *)
end
```
Aka, this requires a translation to some other type `'a View.t`, which is there solely to help people with pattern matching.

Arguably, this translation is probably necessary anyway (I have thoughts on optimization, but not very concrete at the moment), but in this form, it will require the compiler to do a pretty difficult analysis to optimize. Also observe that the sole purpose of `'a view` is just to help people pattern match. The internal representation `'a View.t` is completely irrelevant, because it gets eliminated immediately in pattern matching, and you are essentially just working with recursive sums directly instead of all the `fold` and `unfold` that needs to happen.

I found all this very ugly and unsatisfactory. If you pick the first signature, you get locked into a data representation. If you pick the second signature, you get screwed during pattern matching. So generally people pick the second signature, since at least it is more general.

This happens a lot when you need to write types that have multiple representations. And the point of ML module type theory is precisely to allow multiple implementations. For instance, for locally nameless form of the Debruijn representation, trying to do pattern matching can be hell when you need to switch between representations manually. A similar issue is working with streams, where you need to do this kind of fold/unfold constantly.

## My Idea for A Fix

So there are two questions with writing it the straightforward way. The first question here being, ignoring the pattern matching part, should this typecheck?
```
structure StackList :> sig
  datatype 'a t = Empty | Stack of 'a * 'a t
end = struct
  type 'a t = 'a list

  val Empty = Nil
  val Cons (h , t) = Stack (h , t)

  (* do something about patterns *)
end
```

My answer to this is an emphatic **yes**. Of course this should typecheck. Because from the perspective of Harper-Stone, datatypes are *just* modules, and hence datatype specifications are *just* signatures. Who cares if you are implementing recursive sums exactly the way the "canonical compiler" dictates! If you have a more efficient representation, it should typecheck by Harper-Stone, and you should be able to replace it with a better one.

This means that you can represent booleans with integers or natural numbers with integers. For example, I think this should typecheck:
```
structure BoolInt : sig
  datatype t = True | False
end = struct
  type t = int

  val True = 1
  val False = 0

  (* do something about patterns *)
end
structure NatInt : sig
  datatype t = Z | S of t
end = struct
  type t = int

  val Z = 0
  fun S v = v + 1

  (* do something about patterns *)
end
```
This is obviously a better natural number implementation than what the definition of Standard ML dictates the signature to be. You can work with natural numbers inductively, but it is also represented internally efficiently. So you get the best of both worlds here.

The motivation above brings us to the natural question on what to do about patterns here, and that is not so obvious. My current idea is to basically have a specific pattern construct so that it can be used as elaboration for pattern matching. This idea was basically stolen from Rossberg's HamLetS (except that conversion only goes one way):
```
structure NatInt : sig
  datatype t = Z | S of t
end = struct
  type t = int

  val Z = 0
  fun S v = v + 1

  pattern t (as t2) Z | S of t = pat
    fun convert (v : t) : t2 =
      case v of
      | 0 => Z
      | _ => S (v - 1)
  end
end
```
In the pattern declaration, `Z` and `S` are functions only available within the `pat ... end` block, whereas outside the block only the pattern is available for use.

Similarly, just as you can view a binary search tree as both a tree and a sorted list, a type can have multiple patterns. I haven't worked out the details yet but I suspect it can be annoying to elaborate, especially with polymorphism in the type. A nice thing here is that it doesn't just allow you to write the conversion eagerly, but in the above example it also works on as "as needed" basis for pattern matching, where only the stuff you pattern much gets evaluated, even in complex patterns. Hence,
```
case i : NatInt.t of
| S (S v) => e
```
becomes
```
case convert i of
| S x' =>
  case convert x' of
  | S v => e (* v here is still an int, internally *)
```
whereas if you insist on evaluating stuff eagerly here (I don't see why you would), you can still do:
```
  pattern t (as t2) Z | S of t2 = pat
    fun convert (v : t) : t2 =
      case v of
      | 0 => Z
      | _ => S (convert (v - 1))
  end
```

But more importantly, it "completes" the Harper-Stone interpretation nicely without compromises. This signature:
```
sig
  datatype t = Z | S of t
end
```
is now syntatic sugar and completely identical to this one:
```
sig
  type t

  val Z : t
  val S : t -> t

  pattern t (as t2) of Z | S of t
end
```
Similarly, the so-called "GADTs" are just modules, with some special typechecking rules for the typechecker:
```
sig
  datatype 'a exp =
  | Int : int -> int exp
  | String : string -> string exp
  | Plus : int exp * int exp -> int exp
end
```
is just
```
sig
  type 'a exp

  val Int : int -> int exp
  val String : string -> string exp
  val Plus : int exp * int exp -> int exp

  pattern 'a exp (as 'a exp2) of
    Int : int -> int exp
  | String : string -> string exp
  | Plus : int exp * int exp -> int exp
end
```
and can be implemented with a "regular" datatype for all you care:
```
struct E : E = struct
  datatype exp =
  | Int of int
  | String of string
  | Plus of exp * exp
  (* etc *)
end
```
And everything typechecks and everyone is happy. Probably. (There are still a bunch of corners I haven't ironed out here yet.)

# Issue 2: The Modular Type Classes Paper

So there's this paper {% cite DHCK2007 %} that describes the point of view of some modules as type classes, and doing dictionary construction on it. I agree with the paper "in spirit". This is how most ML programmers think about certain modules with a "most important" type anyway.

My main problem with this paper is the implementation, which I don't agree with. There are two main issues on top of my mind, one is practical and one theoretical. But in either case, the problem is dealing with the actual metatheory of ML rather than the much more simplified case in the paper.

On the practical side, the issue with the actual ML language is that it has much more annoying types to deal with, in particular n-ary products and n-ary sums. For example, suppose I want to write a functor for equality, how do I actually do it? If I do:
```
functor Eq (structure A : EQ structure B : EQ) : EQ = struct
  type t = A.t * B.t
  fun == ((a, a'), (b, b')) = a === b andalso a' = b'
end
```
which really only works for the exact binary product type `A * B`, but in ML, you can have n-ary products, and you can have products with labels. You can't actually write something like:
```
functor Eq(structure A : EQ, structure A2 : EQ, ... ) : EQ
```
This makes no sense. It breaks everything about functors because you need to have to deal with arbitrary specs, which does not have any type theoretic meaning.

A similar issue is with `datatype` and labeled products. Once in a while, the label can actually matter, for example, in a "Show" functor that prints out values. If you want to print out a labeled product, you probably will want to print the label as well. So your specification will need to look something more like:
```
functor Show(
  val labelA : string
  structure A : SHOW
  val labelB : string
  structure B : SHOW
) : SHOW = struct
  type t = (* what do I put here? *)
  fun show (a , b) = String.concat [{ , labelA , : , show A (* etc *)
end
```
It's also pretty questionable what you'll need to instantiate this functor by hand.

My take on this is: it doesn't appear to be avoidable, that in general some form of metaprogramming will need to be involved, which is all about looking at the type and constructing programs. I don't see any other way, especially in the second case. So what `deriving` should do is to both be able to derive the exact module for the type given a signature, and also a functor for signature, since that type can be arbitrary. That code will need to live in the compiler rather than be possible to hand write.

The next one is a theoretical issue with recursive types. For simple cases of recursive types, it is probably okay. For example:
```
datatype foo = Int of int | Foo of foo
```
One possible functor we can write for `EQ` is probably:
```
functor Foo(structure Int : EQ) : EQ = struct
  datatype t = Int of Int.int | Foo of t (* this needs to be not generative *)
  fun == (a , b) =
    case (a , b) of
      (Int i , Int j) => Int.== (i ,j)
    | (Foo a , Foo b) => == (a , b)
end
```
We can probably agree that this is the right functor, since if we take another specification `structure Foo : EQ`, it breaks the interpretation of datatypes being generative (which we'll need to work around in the internal language), but more importantly, makes this functor impossible to instantiate.

What is much worse, however, are mutually recursive types, for example:
```
datatype foo = Int of int | Bar of bar
and bar = Foo of foo
```
Even if we generate two functors:
```
functor FooEq(
  structure Int : EQ
  structure Bar : EQ
) : EQ
functor BarEq(
  structure Foo : EQ
) : EQ
```

This is impossible to instantiate either, since they are mutually dependent on either other's implementation.

But let's take a step back for a moment. Suppose that we give up being able to customize the specific equality used for both `foo` and `bar`. We are left with:
```
functor FooEq(structure Int : EQ) : EQ = struct
  fun == (a , b) =
    case (a , b) of
    | (Bar a, Bar b) => (* what now ? *)
end
structure BarEq : EQ = struct
  fun == (a , b) =
    case (a , b) of
    | (Foo a, Foo b) => (* what now ? *)
end
```
At this point, both modules depend on each other, and even worse, `BarEq`, in a way, implicitly needs to depend on the implementation of integer equality from `FooEq` (which of course, makes sense looking at the type). But how to write the code?

This can be quite the headache, since if you're me, you really want to avoid the theory of recursive modules. I found the theory rather painful to handle in so many ways. I have to be honest that I haven't figured out yet, but on the top of my head, if we ignore potentially a backpatching solution, this will probably also work:
```
functor FooBarEq(structure Int : EQ) = struct
  type t = (* ... *)

  fun fooeq (a , b) =
    case (a , b) of
    | (Int a , Int b) => Int.== (a , b)
    | (Bar a , Bar b) => bareq (a , b)
  and bareq (a , b) =
    case (a , b) of
    | (Foo a , Foo b) => fooeq (a , b)

  structure FooEq : EQ = struct
    type t = foo
    val == = fooeq
  end
  structure BarEq : EQ = struct
    type t = bar
    val == = bareq
  end
end
```
and then we round it out with
```
functor FooEq(structure Int : EQ) : EQ =
let
  structure E = FooBarEq(structure Int = Int)
in
  E.FooEq
end
functor BarEq(structure Int : EQ) : EQ =
let
  structure E = FooBarEq(structure Int = Int)
in
  E.BarEq
end
```
Which is a very convoluted way of avoiding recursive modules by just constructing recursive functions and placing them in the right place.

# Thoughts

Either way, there's still a long ways to go, but in however many years I actually finish this stuff, it will likely require a rewrite of libraries (which I suspect will need to happen anyway, just by killing `eqtype`). So here comes probably another year of no blog updates.
